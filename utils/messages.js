// used for converting string to object
// for name and other strings
const moment = require('moment');
function formatMessage(username,msg) {
    return {
        username,
        msg,
        time :moment().format('h:m a')
    }
}
module.exports = formatMessage;