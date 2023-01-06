var express = require('express');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, '../build')));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log('Start React application');
  console.log(process.env.REACT_APP_BACKEND_URL);
  console.log(process.env.REACT_APP_SOCKET_HOST);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
