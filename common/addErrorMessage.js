
module.exports = {

// param - an array of the parameter path sections where the error occurred
// el - the element to add to the error message object
// obj - the error message object
// mutates obj, and returns the mutated object
    addErrorMessage: function (param, el, obj) {
        var key = param.shift();
        if (param.length === 0) {
            if (obj.hasOwnProperty(key))
                obj[key].push(el);
            else
                obj[key] = [el];
        } else {
            if (!obj.hasOwnProperty(key))
                obj[key] = {};
            this.addErrorMessage(param, el, obj[key])
        }
        return obj;
    }
};
