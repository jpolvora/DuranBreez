define(function (require) {
    var app = require('durandal/app');

    var ViewModelFormBase = function (item, displayName) {
        if (arguments.length === 0) {
            return;
        }
        this.model = item;
        this.displayName = ko.observable(displayName);
    };

    ViewModelFormBase.prototype.ok = function () {
        this.dialogResult = true;
        this.modal.close(this);
    };

    ViewModelFormBase.prototype.cancel = function () {
        this.dialogResult = false;
        this.modal.close();
    };

    ViewModelFormBase.prototype.canDeactivate = function () {
        if (this.dialogResult)
            return true;

        var item = this.model;
        var state = item.entityAspect.entityState;
        if (state.isAddedModifiedOrDeleted()) {
            return app.showMessage('Are you sure do you want to cancel?', 'Cancel', ['Yes', 'No'])
                .then(function (result) {
                    if (result === "Yes") {
                        item.entityAspect.rejectChanges();
                        return true;
                    }
                    return false;
                });
        }

        return true;
    };

    ViewModelFormBase.makeSubClass = function (Type) {
        Type.prototype = new ViewModelFormBase();
        Type.prototype.contructor = Type;
    };

    return ViewModelFormBase;
});