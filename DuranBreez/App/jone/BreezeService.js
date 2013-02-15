define(function (require) {
    var system = require('durandal/system');
    var toastr = require('toastr');

    var toast = toastr || system; //fallback to system.log in case toastr not global var
    if (toast == system) {
        var logg = function (msg) {
            system.log(msg);
        }
        toast.info = toast.success = toast.error = logg;
    }


    function getNewManager(apiController) {
        var entityManager = new breeze.EntityManager({
            serviceName: apiController,
            metadataStore: BreezeService.Store
        });

        return entityManager;
    }

    function BreezeService(theArgs) {
        //parametros obrigatorios
        //mandatory parameters
        this.manager = getNewManager(theArgs.apiController);
        this.entityType = theArgs.entityType;
        this.apiMethod = theArgs.apiMethod;

        //parametros opcionais ou com valor default
        //option parameters with default values
        this.predicateFunction = theArgs.predicateFunction || undefined;
        this.orderByExpr = theArgs.orderBy || "Id";
        this.selectedFields = theArgs.selectedFields || undefined;
        this.valuesFactory = theArgs.valuesFactory || {};
        this.expandedProperties = theArgs.expandedProperties || [];
    }

    //static metadatastore
    BreezeService.Store = new breeze.MetadataStore();

    BreezeService.initialize = function (api, useLocalCacheIfAvailable, callback) {
        function metaSuccess(meta) {
            if (meta) {
                if (useLocalCacheIfAvailable) {
                    var metadataAsString = BreezeService.Store.exportMetadata();
                    window.localStorage.setItem("metadata", metadataAsString);
                }
                toast.info("Metadata loaded from server: " + meta.entityContainer.name);
            } else {
                toast.info("Metadata loaded from local storage");
            }
            callback();
        }

        function metaError(error) {
            toast.error("Metadata failed!" + error.message);
        }
        if (useLocalCacheIfAvailable) {
            var metadataFromStorage = window.localStorage.getItem("metadata");
            if (metadataFromStorage) {
                BreezeService.Store.importMetadata(metadataFromStorage);
                metaSuccess(null);
            }
        } else {
            toast.info('Loading metadata from server...');
            BreezeService.Store.fetchMetadata(api).then(metaSuccess).fail(metaError);
        }

    };

    //quick static query
    BreezeService.GetArray = function (manager, method, predicate) {
        manager = manager || getNewManager();
        var query = breeze.EntityQuery.from(method);
        if (predicate !== undefined)
            query = query.where(predicate);

        return manager.executeQuery(query)
        .fail(function (err) {
            toast.error(err.message);
        });
    };

    BreezeService.prototype.createNew = function () {
        return this.manager.createEntity(this.entityType, this.valuesFactory());
    };

    BreezeService.prototype.get = function (id) {
        return this.manager.fetchEntityByKey(this.entityType, id, true)
            .fail(function (err) {
                toast.error(err.message);
            });
    };

    BreezeService.prototype.getEntities = function (callback, toSkip, toTake) {
        function queryFailed(error) {
            toast.error(error.message, "getEntities");
            callback([]);
        }

        var method = this.apiMethod;
        var order = this.orderByExpr;
        var query = breeze.EntityQuery.from(method);

        var pred = this.predicateFunction !== undefined ? this.predicateFunction() : null;

        if (pred != null)
            query = query.where(pred);

        if (toSkip > 0) {
            query = query.skip(toSkip);
        }
        if (toTake > 0) {
            query = query.take(toTake);
        }
        query = query.orderBy(order).inlineCount();

        if (this.selectedFields !== undefined) {
            query = query.select(this.selectedFields);
        }

        if ($.isArray(this.expandedProperties)) {
            query = query.expand(this.expandedProperties.join(', '));
        }

        return this.manager.executeQuery(query)
                        .then(callback)
                        .fail(queryFailed);
    };

    BreezeService.prototype.saveChanges = function (callback) {
        var hasChanges = this.manager.hasChanges();

        if (!hasChanges) {
            callback();
            return false;
        }

        function saveFailed(error) {
            toast.error(error.message, "saveChanges");
            callback(error);
        }

        function saveSuceedeed() {
            toast.success("Dados gravados !!!", "saveChanges");
            callback();
        }

        return this.manager.saveChanges()
            .then(saveSuceedeed)
            .fail(saveFailed);
    };

    return BreezeService;
});