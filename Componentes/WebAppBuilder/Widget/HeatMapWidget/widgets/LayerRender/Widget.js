define(['dojo/on',
        'dojo/dom',
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
        "dojo/dom-style",
        "dojo/dom-construct",
        'dijit/_WidgetsInTemplateMixin',
        'jimu/BaseWidget',
        'jimu/LayerInfos/LayerInfos',
        'jimu/dijit/Message',
        'esri/tasks/query',
        'jimu/loaderplugins/order-loader!widgets/LayerRender/plugins/heatmap',
        'jimu/loaderplugins/order-loader!widgets/LayerRender/plugins/heatmap-arcgis'],
function(on, dom, declare, lang, array, domStyle, domConstruct, _WidgetsInTemplateMixin, BaseWidget,
         LayerInfos, Message, Query) {

  return declare([BaseWidget, _WidgetsInTemplateMixin], {

    baseClass: 'jimu-widget-layerrender',
    name: 'LayerRender',
    data: [],
    isHeatmap: false,
    operLayer: null,
    heatLayer: null,
    clusterLayer: null,

    postCreate: function() {
        this.inherited(arguments);
    },

    startup: function() {
        this.inherited(arguments);
    },

    onOpen: function(){
        this._loadLayer();
    },

    onClose:function(){
        //this.showGeo();
    },

    showHeatmap: function() {
        var self = this;
        this.isHeatmap = true;

        if(!this._validation()) return;
        this._createHeatmapDivFixer();
        if(this.heatLayer == null) {
            this.heatLayer = new HeatmapLayer({
                config:{
                    "useLocalMaximum": true
                },
                "map": this.map,
                "domNodeId": "heatLayer",
                "opacity": 0.85
            });
            
            this.map.addLayer(this.heatLayer, 1);
            self._changeCheckboxStatus(true, this.heatLayer.id);
            this.map.resize();
        }
        this._getHeatmapFeatures();
        on(this.map, "extent-change", function (ext) {
            if(!self.isHeatmap) return;
            self._getHeatmapFeatures();
            self.operLayer.setVisibility(false);
            self.heatLayer.setVisibility(true);
            self._changeCheckboxStatus(false, self.operLayer.id);
            self._changeCheckboxStatus(true, self.heatLayer.id);
        });

    },

    showGeo: function() {
        this.isHeatmap = false;
        if(!this._validation()) return;
        this.operLayer.setVisibility(true);
        this._changeCheckboxStatus(true, this.operLayer.id);
        if(this.heatLayer == null) return;
        this.heatLayer.setVisibility(false);
        this._changeCheckboxStatus(false, this.heatLayer.id);
    },

    _loadLayer: function() {
        var self = this;
        if(!this._validation()) return;
        LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, function(operLayerInfos) {
            array.forEach(operLayerInfos.operLayers, function(layer) {
                if(layer.title != self.config.layerName) return;
                self.operLayer = self.map.getLayer(layer.id);
            });
        }));
    },

    _getHeatmapFeatures: function() {
        var self = this;
        var query = new Query();
        this._displayWait(true);
        query.geometry = map.extent;
        query.where = this.config.whereClause != '' ? this.config.whereClause : '1=1';
        query.outSpatialReference = this.map.spatialReference;

        this.operLayer.queryFeatures(query, function (featureSet) {
            if (featureSet && featureSet.features && featureSet.features.length > 0) {
                self.data = featureSet.features;
            }
            self.heatLayer.setData(self.data);
            self.heatLayer.setVisibility(true);
            self.operLayer.setVisibility(false);
            self._changeCheckboxStatus(true, self.heatLayer.id);
            self._changeCheckboxStatus(false, self.operLayer.id);
            self._displayWait(false);
        });
    },

    _createHeatmapDivFixer: function() {
        if(dom.byId('heatLayer') != undefined) return;
        var parent = dom.byId('map').parentElement;
        domConstruct.place(domConstruct.toDom('<div id="heatLayer"></div>'), parent);
    },

    _validation: function() {
        if (!this.map.itemId) {
            new Message({
                message: this.nls.msgMapError
            });
            return false;
        }
        if(this.config.layerName == '') {
            new Message({
                message: this.nls.lyrNotFound
            });
            return false;
        }
        return true;
    },

    _displayWait: function(isShow) {
        if(isShow) {
            domStyle.set(this.wait, "display", "block");
            domStyle.set(this.btns, "display", "none");
        }
        else {
            domStyle.set(this.wait, "display", "none");
            domStyle.set(this.btns, "display", "block");
        }
    },
    _changeCheckboxStatus: function(checked, id){
        var checkbox = dojo.query("." + id +" div")[1];
        if (checkbox != null) {
            if (checked) {
                dojo.addClass(dojo.query("." + id +" div")[1], "checked");
            }
            else{
                dojo.removeClass(dojo.query("." + id +" div")[1], "checked");
            }
        }
    }
  });
});