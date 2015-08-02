module.exports = {
    todayAsDate: function () {
        var today = new Date();
        return new Date((today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear() + " UTC");
    },

// format the time part of a date as 1:05 PM
    dateToTimeString: function (date) {
        var hour = 0;
        var amPm = "AM";
        var UTCHours = date.getUTCHours();
        switch (UTCHours) {
            case 0:
                hour = 12;
                amPm = "AM";
                break;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
                hour = UTCHours;
                amPm = "AM";
                break;
            case 12:
                hour = 12;
                amPm = "PM";
                break;
            default:
                hour = UTCHours - 12;
                amPm = "PM";
        }
        var UTCMinutes = date.getUTCMinutes();
        if (UTCMinutes < 10)
            UTCMinutes = "0" + UTCMinutes;
        return hour + ":" + UTCMinutes + " " + amPm;
    }
};

