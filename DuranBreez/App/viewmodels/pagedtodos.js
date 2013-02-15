define(function (require) {
    var
        system = require('durandal/system'),
        app = require('durandal/app'),
        service = require('jone/BreezeService'),
        form = require('viewmodels/categoriaForm'),
        ViewModelBase = require('jone/ViewModelBase'),

        valuesFactory = function () {
            return {
                //Id: 0,
                //EmpresaId: 1,
                //TipoCategoria: 5,
                //Descricao: "[descrição]",
                //Status: 1
            };
        };

    var Ctor = function () {
        ViewModelBase.call(this, {
            form: form,
            apiController: 'api/BreezeSample',
            entityType: 'TodoItem',
            apiMethod: 'Todos',
            orderByExpr: 'Id',
            valuesFactory: valuesFactory,
            expandedProperties: []
        });

        //custom properties        
        this.displayName = "Todo Items";
    };

    ViewModelBase.makeSubClass(Ctor);

    return new Ctor();
});