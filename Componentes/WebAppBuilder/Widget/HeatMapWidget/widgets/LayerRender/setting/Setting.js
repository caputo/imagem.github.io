define([
    'dojo/_base/declare',
    'jimu/BaseWidgetSetting',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/TextBox',
  ],
  function(
    declare,
    BaseWidgetSetting,
    _WidgetsInTemplateMixin) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

      baseClass: 'jimu-widget-layerRender-setting',

      startup: function() {
        this.inherited(arguments);
        this.setConfig(this.config);
      },

      setConfig: function(config) {
          this.layerName.set('value', config.layerName);
          this.whereClause.set('value', config.whereClause);
      },

      getConfig: function() {
        this.config.layerName = this.layerName.get('value');
        this.config.whereClause = this.whereClause.get('value');
        return this.config;
      }

    });
  });
