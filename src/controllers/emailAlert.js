var nodemailer = require('nodemailer');
// email sender function
exports.sendEmail = function (req, res, asunto, msg, to) {
  // Definimos el transporter
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'enrique.deridder@habitant.es',
      pass: '79118132h'
    }
  });
  // Definimos el email
  var mailOptions = {
    from: 'enrique.deridder@habitant.es',
    to: to,
    subject: asunto,
    html: `${msg}`
  };
  // Enviamos el email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.send(500, err.message);
    } else {
      console.log("Email sent");
      res.status(200).jsonp(req.body);
    }
  });
};
