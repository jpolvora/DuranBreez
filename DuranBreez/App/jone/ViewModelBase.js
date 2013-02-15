define(function (require) {
    var
        system = require('durandal/system'),
        app = require('durandal/app'),
        BreezeService = require('jone/BreezeService'),

        ViewModelBase = function (theArgs) {
            //prevent instantiation (when setting prototype constructor for another object)
            if (arguments.length === 0) {
                return;
            }

            var self = this;
            this.form = theArgs.form || undefined;
            this.service = new BreezeService(theArgs);

            this.entities = ko.observableArray([]);
            this.isBusy = ko.observable(false);
            this.noChanges = ko.observable(true);

            //insert visible only if we have a form
            this.editable = ko.observable(this.form !== undefined);

            //paging
            this.pageSize = ko.observable(10);
            this.currentPage = ko.observable(1);
            this.totalPageCount = ko.observable(0);
            this.pageLinks = ko.observableArray([]);

            function editModel(item, event, isNew) {
                var displayname = isNew ? "Creating new " + theArgs.entityType : "Editing " + theArgs.entityType
                var form = self.createForm(item, displayname);
                return app.showModal(form).then(function (result) {
                    if (result === undefined) {
                        self.service.manager.rejectChanges();
                        if (isNew) {
                            self.entities.remove(item);
                        }
                    }
                    return true;
                });
            }

            function removeModel(item) {
                return app.showMessage("Delete this data row ?", "Please Confirm", ['Yes', 'No'])
                  .then(function (result) {
                      if (result === "Yes") {
                          item.entityAspect.setDeleted();
                          self.entities.remove(item);
                          return true;
                      }
                      return false;
                  });
            }

            this.edit = function (item, event, isNew) {
                isNew = typeof isNew !== 'undefined' ? isNew : false;
                editModel(item, event, isNew);
            };

            this.remove = removeModel;
        };

    ViewModelBase.prototype.createForm = function (model, displayName) {
        if (this.form === 'undefined')
            return;

        return new this.form(model, displayName);
    };

    ViewModelBase.prototype.get = function () {
        var self = this;
        self.isBusy(true);

        //fix
        var cpage = self.currentPage();
        if (cpage < 1) {
            cpage = 1;
            self.currentPage(cpage);
        }

        var toSkip = self.pageSize() * (self.currentPage() - 1);

        return self.service.getEntities(function (data) {
            self.isBusy(false);
            if (typeof data !== 'undefined' && data.results && data.results.length >= 0) {
                self.entities(data.results);
                var pcount = Math.ceil(data.inlineCount + self.pageSize() - 1) / self.pageSize();
                self.pageLinks().length = 0; //clear observable array
                for (k = 0; k < pcount - 1 ; k++) {
                    var c = k + 1;
                    self.pageLinks.push({ pageNumber: c, isCurrent: (cpage == c), instance: self });
                }
            }
        }, toSkip, self.pageSize());
    };

    ViewModelBase.prototype.gotoPage = function (model) {
        var vm = model.instance;
        vm.currentPage(model.pageNumber);
        return vm.get.call(vm); //fix 'this'
    };

    ViewModelBase.prototype.save = function () {
        var self = this;
        self.isBusy(true);
        return this.service.saveChanges(function () {
            self.isBusy(false);
        });
    };

    ViewModelBase.prototype.cancel = function () {
        var self = this;
        if (self.service.manager.hasChanges()) {
            return app.showMessage('Discard changes?', 'Please confirm', ['Yes', 'No'])
                        .then(function (result) {
                            if (result === "Yes") {
                                self.service.manager.rejectChanges();
                                return true;
                            }
                            return false;
                        });
        }
        return false;
    };

    ViewModelBase.prototype.insert = function () {
        var item = this.service.createNew();
        this.entities.push(item);
        return this.edit(item, undefined, true);
    };

    ViewModelBase.prototype.activate = function (data) {
        var self = this;
        this.routeInfo = data;
        this.token = this.service.manager.hasChangesChanged.subscribe(function (args) {
            if (args.hasChanges) {
                self.noChanges(false);
            } else {
                self.noChanges(true);
            }
        });
        return this.get();
    };

    ViewModelBase.prototype.canDeactivate = function () {
        var self = this;
        if (self.service.manager.hasChanges()) {
            return app.showMessage('Discard changes?', 'Navigate away', ['Yes', 'No'])
                    .then(function (result) {
                        if (result === "Yes") {
                            self.service.manager.rejectChanges();
                            return true;
                        }
                        return false;
                    });
        }
        return true;
    };

    ViewModelBase.prototype.deactivate = function (closed) {
        this.service.manager.hasChangesChanged.unsubscribe(this.token);
        system.log("deactivated");
    };

    ViewModelBase.makeSubClass = function (Type) {
        Type.prototype = new ViewModelBase();
        Type.prototype.contructor = Type;
    };

    //returning the function
    return ViewModelBase;
});