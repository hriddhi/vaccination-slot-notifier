const axios = require('axios').default
const nodemailer = require('nodemailer');

var wait = false

var getDate = () => {
    let date = new Date(Date.now()).toLocaleString().split(',')[0].split('/')
    if(date[0].length === 1)
        date[0] = '0'.concat(date[0])
    if(date[1].length === 1)
        date[1] = '0'.concat(date[1])

    return date.join('-')
}

var sendNotification = (str) => {
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'hriddhimondal@gmail.com',
          pass: '11600117040'
        }
    });
    
    var mailOptions = {
        from: 'hriddhimondal@gmail.com',
        to: 'hriddhi1990@gmail.com, adritaroy567@gmail.com',
        subject: 'Slots Available',
        text: str
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            wait = true
            setTimeout(() => wait = false, 1000 * 60 * 4)
        }
    });
}

var fetch = () => {
    axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=721&date=${getDate()}`)
    .then(res => res.data.centers)
    .then(data => {
        var sendMail = false
        var mailBody = ''
        data.forEach(e => {
            if((e.block_name === 'Howrah Municipal Corporation' || e.district_name === 'Kolkata') && e.sessions.find(session => session.min_age_limit === 18)){
                let str = `\n${e.name} ------ ${e.address}\n`
                let flag = true
                e.sessions.forEach(s => {
                    if(s.min_age_limit === 18){
                        if(flag){
                            str = str.concat(`${s.date} - ${s.available_capacity_dose1}`)
                            flag = false
                        } else {
                            str = str.concat(` | ${s.date} - ${s.available_capacity_dose1}`)
                        }
                        sendMail = s.available_capacity_dose1 !== 0 ? true : false
                    }
                })
                console.log(str)
                mailBody = mailBody.concat(`${str}\n`)
            }
        });
        if(sendMail && !wait)
            sendNotification(mailBody)
    })
    .catch(err => console.error(err))
}

setInterval(fetch, 1000 * 20)