
gdjs.evtsExt__ActionCard__ActionCard = gdjs.evtsExt__ActionCard__ActionCard || {};

/**
 * Object generated from ActionCardSpell
 */
gdjs.evtsExt__ActionCard__ActionCard.ActionCard = class ActionCard extends gdjs.CustomRuntimeObject2D {
  constructor(parentInstanceContainer, objectData, instanceData) {
    super(parentInstanceContainer, objectData, instanceData);
    this._parentInstanceContainer = parentInstanceContainer;

    this._onceTriggers = new gdjs.OnceTriggers();
    this._objectData = {};
    
    this._objectData.LV = objectData.content.LV !== undefined ? objectData.content.LV : Number("") || 0;
    this._objectData.Name = objectData.content.Name !== undefined ? objectData.content.Name : "";
    this._objectData.School = objectData.content.School !== undefined ? objectData.content.School : "";
    this._objectData.Range = objectData.content.Range !== undefined ? objectData.content.Range : Number("18") || 0;
    this._objectData.Components = objectData.content.Components !== undefined ? objectData.content.Components : "V, S, M";
    this._objectData.CastingTime = objectData.content.CastingTime !== undefined ? objectData.content.CastingTime : "";
    this._objectData.Duration = objectData.content.Duration !== undefined ? objectData.content.Duration : "";
    this._objectData.IMG = objectData.content.IMG !== undefined ? objectData.content.IMG : "WIP";
    this._objectData.Description = objectData.content.Description !== undefined ? objectData.content.Description : "Lança uma bola de fogo";
    this._objectData.Event = objectData.content.Event !== undefined ? objectData.content.Event : "";
    this._objectData.TargetType = objectData.content.TargetType !== undefined ? objectData.content.TargetType : "";
    

    // It calls the onCreated super implementation at the end.
    this.onCreated();
  }

  // Hot-reload:
  updateFromObjectData(oldObjectData, newObjectData) {
    super.updateFromObjectData(oldObjectData, newObjectData);
    if (oldObjectData.content.LV !== newObjectData.content.LV)
      this._objectData.LV = newObjectData.content.LV;
    if (oldObjectData.content.Name !== newObjectData.content.Name)
      this._objectData.Name = newObjectData.content.Name;
    if (oldObjectData.content.School !== newObjectData.content.School)
      this._objectData.School = newObjectData.content.School;
    if (oldObjectData.content.Range !== newObjectData.content.Range)
      this._objectData.Range = newObjectData.content.Range;
    if (oldObjectData.content.Components !== newObjectData.content.Components)
      this._objectData.Components = newObjectData.content.Components;
    if (oldObjectData.content.CastingTime !== newObjectData.content.CastingTime)
      this._objectData.CastingTime = newObjectData.content.CastingTime;
    if (oldObjectData.content.Duration !== newObjectData.content.Duration)
      this._objectData.Duration = newObjectData.content.Duration;
    if (oldObjectData.content.IMG !== newObjectData.content.IMG)
      this._objectData.IMG = newObjectData.content.IMG;
    if (oldObjectData.content.Description !== newObjectData.content.Description)
      this._objectData.Description = newObjectData.content.Description;
    if (oldObjectData.content.Event !== newObjectData.content.Event)
      this._objectData.Event = newObjectData.content.Event;
    if (oldObjectData.content.TargetType !== newObjectData.content.TargetType)
      this._objectData.TargetType = newObjectData.content.TargetType;

    this.onHotReloading(this._parentInstanceContainer);
    return true;
  }

  // Properties:
  
  _getLV() {
    return this._objectData.LV !== undefined ? this._objectData.LV : Number("") || 0;
  }
  _setLV(newValue) {
    this._objectData.LV = newValue;
  }
  _getName() {
    return this._objectData.Name !== undefined ? this._objectData.Name : "";
  }
  _setName(newValue) {
    this._objectData.Name = newValue;
  }
  _getSchool() {
    return this._objectData.School !== undefined ? this._objectData.School : "";
  }
  _setSchool(newValue) {
    this._objectData.School = newValue;
  }
  _getRange() {
    return this._objectData.Range !== undefined ? this._objectData.Range : Number("18") || 0;
  }
  _setRange(newValue) {
    this._objectData.Range = newValue;
  }
  _getComponents() {
    return this._objectData.Components !== undefined ? this._objectData.Components : "V, S, M";
  }
  _setComponents(newValue) {
    this._objectData.Components = newValue;
  }
  _getCastingTime() {
    return this._objectData.CastingTime !== undefined ? this._objectData.CastingTime : "";
  }
  _setCastingTime(newValue) {
    this._objectData.CastingTime = newValue;
  }
  _getDuration() {
    return this._objectData.Duration !== undefined ? this._objectData.Duration : "";
  }
  _setDuration(newValue) {
    this._objectData.Duration = newValue;
  }
  _getIMG() {
    return this._objectData.IMG !== undefined ? this._objectData.IMG : "WIP";
  }
  _setIMG(newValue) {
    this._objectData.IMG = newValue;
  }
  _getDescription() {
    return this._objectData.Description !== undefined ? this._objectData.Description : "Lança uma bola de fogo";
  }
  _setDescription(newValue) {
    this._objectData.Description = newValue;
  }
  _getEvent() {
    return this._objectData.Event !== undefined ? this._objectData.Event : "";
  }
  _setEvent(newValue) {
    this._objectData.Event = newValue;
  }
  _getTargetType() {
    return this._objectData.TargetType !== undefined ? this._objectData.TargetType : "";
  }
  _setTargetType(newValue) {
    this._objectData.TargetType = newValue;
  }

  

  
}

// Methods:
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getIMG();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMG = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.IMGContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.mapOfGDgdjs_9546evtsExt_9595_9595ActionCard_9595_9595ActionCard_9546ActionCard_9546prototype_9546SetIMGContext_9546GDAction_95959595C_95959595ImgObjects1Objects = Hashtable.newFrom({"Action_C_Img": gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595ImgObjects1});
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Img"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595ImgObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setIMG(eventsFunctionContext.getArgument("Value"))
}
{gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSprite.func(runtimeScene, eventsFunctionContext.getArgument("Value"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.mapOfGDgdjs_9546evtsExt_9595_9595ActionCard_9595_9595ActionCard_9546ActionCard_9546prototype_9546SetIMGContext_9546GDAction_95959595C_95959595ImgObjects1Objects, false, eventsFunctionContext);
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMG = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetIMGContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getDuration();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.Duration = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DurationContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Duration"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595DurationObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setDuration(eventsFunctionContext.getArgument("Value"))
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595DurationObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595DurationObjects1[i].setBBText(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDuration = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDurationContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getCastingTime();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTime = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.CastingTimeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Cast"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CastObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setCastingTime(eventsFunctionContext.getArgument("Value"))
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CastObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CastObjects1[i].setBBText(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTime = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetCastingTimeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getComponents();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.Components = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.ComponentsContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Comp"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CompObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setComponents(eventsFunctionContext.getArgument("Value"))
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CompObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CompObjects1[i].setBBText(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponents = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetComponentsContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getRange();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.Range = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.RangeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Range"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595RangeObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setRange(eventsFunctionContext.getArgument("Value"))
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595RangeObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595RangeObjects1[i].setBBText(("" + eventsFunctionContext.getArgument("Value")));
}
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRange = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetRangeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getSchool();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.School = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SchoolContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1_1final = [];

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_School"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595SchoolObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setSchool(eventsFunctionContext.getArgument("Value"))
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595SchoolObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595SchoolObjects1[i].setBBText(eventsFunctionContext.getArgument("Value"));
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i].School(eventsFunctionContext) == "0" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1[i].setColor("3498DB");
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i].School(eventsFunctionContext) == "1" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1[i].setColor("BDC3C7");
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i].School(eventsFunctionContext) == "2" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1[i].setColor("F1C40F");
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i].School(eventsFunctionContext) == "3" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1[i].setColor("E91E63");
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i].School(eventsFunctionContext) == "4" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1[i].setColor("E67E22");
}
}
}

}


{

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length = 0;


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1_1final.length = 0;
let isConditionTrue_1 = false;
isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2);
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2[i].School(eventsFunctionContext) == "5" ) {
        isConditionTrue_1 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2.length; j < jLen ; ++j) {
        if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1_1final.indexOf(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2[j]) === -1 )
            gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1_1final.push(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2[j]);
    }
}
}
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2);
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2[i].School(eventsFunctionContext) == "Evocação" ) {
        isConditionTrue_1 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2.length; j < jLen ; ++j) {
        if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1_1final.indexOf(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2[j]) === -1 )
            gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1_1final.push(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2[j]);
    }
}
}
{
gdjs.copyArray(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1_1final, gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1);
}
}
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1[i].setColor("9B59B6");
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i].School(eventsFunctionContext) == "6" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1[i].setColor("27AE60");
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i].School(eventsFunctionContext) == "7" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1[i].setColor("D35400");
}
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchool = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetSchoolContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getLV();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LV = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.LVContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Lv"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595LvObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setLV(eventsFunctionContext.getArgument("Value"))
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595LvObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595LvObjects1[i].setBBText(("" + eventsFunctionContext.getArgument("Value")));
}
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLV = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetLVContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getDescription();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.Description = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.DescriptionContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Action_Control"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595ControlObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setDescription(eventsFunctionContext.getArgument("Value"))
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595ControlObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595ControlObjects1[i].setBBText(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescription = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetDescriptionContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getEvent();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.Event = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.EventContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final = [];

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.getObjects("Object")[0]._setEvent(eventsFunctionContext.getArgument("Value"))
}
}

}


{

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length = 0;


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.length = 0;
let isConditionTrue_1 = false;
isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2);
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[i].Event(eventsFunctionContext) == "Magias" ) {
        isConditionTrue_1 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length; j < jLen ; ++j) {
        if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.indexOf(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[j]) === -1 )
            gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.push(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[j]);
    }
}
}
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2);
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[i].Event(eventsFunctionContext) == "Ataques" ) {
        isConditionTrue_1 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length; j < jLen ; ++j) {
        if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.indexOf(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[j]) === -1 )
            gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.push(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[j]);
    }
}
}
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2);
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[i].Event(eventsFunctionContext) == "Pericias" ) {
        isConditionTrue_1 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length; j < jLen ; ++j) {
        if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.indexOf(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[j]) === -1 )
            gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.push(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[j]);
    }
}
}
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2);
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[i].Event(eventsFunctionContext) == "Universais" ) {
        isConditionTrue_1 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length; j < jLen ; ++j) {
        if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.indexOf(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[j]) === -1 )
            gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.push(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[j]);
    }
}
}
{
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2);
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[i].Event(eventsFunctionContext) == "Talentos" ) {
        isConditionTrue_1 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length = k;
if(isConditionTrue_1) {
    isConditionTrue_0 = true;
    for (let j = 0, jLen = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length; j < jLen ; ++j) {
        if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.indexOf(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[j]) === -1 )
            gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final.push(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2[j]);
    }
}
}
{
gdjs.copyArray(gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1_1final, gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1);
}
}
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Cast"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CastObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Comp"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CompObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Duration"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595DurationObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Img"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595ImgObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Lv"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595LvObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Name"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595NameObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Range"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595RangeObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_School"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595SchoolObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Action_Control"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595ControlObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Animation")).setAnimationName(eventsFunctionContext.getArgument("Value"));
}
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595ControlObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595ControlObjects1[i].deleteFromScene(runtimeScene);
}
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595DurationObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595DurationObjects1[i].deleteFromScene(runtimeScene);
}
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CastObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CastObjects1[i].deleteFromScene(runtimeScene);
}
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595ImgObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595ImgObjects1[i].deleteFromScene(runtimeScene);
}
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CompObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CompObjects1[i].deleteFromScene(runtimeScene);
}
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595RangeObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595RangeObjects1[i].deleteFromScene(runtimeScene);
}
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595SchoolObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595SchoolObjects1[i].deleteFromScene(runtimeScene);
}
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595NameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595NameObjects1[i].deleteFromScene(runtimeScene);
}
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595LvObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595LvObjects1[i].deleteFromScene(runtimeScene);
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[i].Event(eventsFunctionContext) == "Atk" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1[i].setColor("FFCA6F");
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[i].Event(eventsFunctionContext) == "Skill" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1[i].setColor("111;191;250");
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[i].Event(eventsFunctionContext) == "General" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1[i].setColor("122;122;122");
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[i].Event(eventsFunctionContext) == "Talent" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1[i].setColor("63;168;65");
}
}
}

}


{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length;i<l;++i) {
    if ( gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[i].Event(eventsFunctionContext) == "Spell" ) {
        isConditionTrue_0 = true;
        gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[k] = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1[i];
        ++k;
    }
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(eventsFunctionContext.getObjects("CardFrame"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1);
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1[i].setColor("255;255;255");
}
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEvent = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetEventContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getName();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.Name = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.NameContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Name"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595NameObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setName(eventsFunctionContext.getArgument("Value"))
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595NameObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595NameObjects1[i].setBBText(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetName = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetNameContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getTargetType();}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetType = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.TargetTypeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext = {};
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.idToCallbackMap = new Map();
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDObjectObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDObjectObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595ImgObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595ImgObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595DurationObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595DurationObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CastObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CastObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CompObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CompObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595RangeObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595RangeObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595SchoolObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595SchoolObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595NameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595NameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595LvObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595LvObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595ControlObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595ControlObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDCardFrameObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDCardFrameObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595TargetObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595TargetObjects2= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595Target_9595txObjects1= [];
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595Target_9595txObjects2= [];


gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Action_C_Target"), gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595TargetObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setTargetType(eventsFunctionContext.getArgument("Value"))
}
{for(var i = 0, len = gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595TargetObjects1.length ;i < len;++i) {
    gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595TargetObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Animation")).setAnimationName(eventsFunctionContext.getArgument("Value"));
}
}
}

}


};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetType = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDAction_9595C_9595ImgObjectsList = [...runtimeScene.getObjects("Action_C_Img")];
var GDAction_9595C_9595ImgObjects = Hashtable.newFrom({"Action_C_Img": thisGDAction_9595C_9595ImgObjectsList});
var thisGDAction_9595C_9595DurationObjectsList = [...runtimeScene.getObjects("Action_C_Duration")];
var GDAction_9595C_9595DurationObjects = Hashtable.newFrom({"Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList});
var thisGDAction_9595C_9595CastObjectsList = [...runtimeScene.getObjects("Action_C_Cast")];
var GDAction_9595C_9595CastObjects = Hashtable.newFrom({"Action_C_Cast": thisGDAction_9595C_9595CastObjectsList});
var thisGDAction_9595C_9595CompObjectsList = [...runtimeScene.getObjects("Action_C_Comp")];
var GDAction_9595C_9595CompObjects = Hashtable.newFrom({"Action_C_Comp": thisGDAction_9595C_9595CompObjectsList});
var thisGDAction_9595C_9595RangeObjectsList = [...runtimeScene.getObjects("Action_C_Range")];
var GDAction_9595C_9595RangeObjects = Hashtable.newFrom({"Action_C_Range": thisGDAction_9595C_9595RangeObjectsList});
var thisGDAction_9595C_9595SchoolObjectsList = [...runtimeScene.getObjects("Action_C_School")];
var GDAction_9595C_9595SchoolObjects = Hashtable.newFrom({"Action_C_School": thisGDAction_9595C_9595SchoolObjectsList});
var thisGDAction_9595C_9595NameObjectsList = [...runtimeScene.getObjects("Action_C_Name")];
var GDAction_9595C_9595NameObjects = Hashtable.newFrom({"Action_C_Name": thisGDAction_9595C_9595NameObjectsList});
var thisGDAction_9595C_9595LvObjectsList = [...runtimeScene.getObjects("Action_C_Lv")];
var GDAction_9595C_9595LvObjects = Hashtable.newFrom({"Action_C_Lv": thisGDAction_9595C_9595LvObjectsList});
var thisGDAction_9595ControlObjectsList = [...runtimeScene.getObjects("Action_Control")];
var GDAction_9595ControlObjects = Hashtable.newFrom({"Action_Control": thisGDAction_9595ControlObjectsList});
var thisGDCardFrameObjectsList = [...runtimeScene.getObjects("CardFrame")];
var GDCardFrameObjects = Hashtable.newFrom({"CardFrame": thisGDCardFrameObjectsList});
var thisGDAction_9595C_9595TargetObjectsList = [...runtimeScene.getObjects("Action_C_Target")];
var GDAction_9595C_9595TargetObjects = Hashtable.newFrom({"Action_C_Target": thisGDAction_9595C_9595TargetObjectsList});
var thisGDAction_9595C_9595Target_9595txObjectsList = [...runtimeScene.getObjects("Action_C_Target_tx")];
var GDAction_9595C_9595Target_9595txObjects = Hashtable.newFrom({"Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Action_C_Img": GDAction_9595C_9595ImgObjects
, "Action_C_Duration": GDAction_9595C_9595DurationObjects
, "Action_C_Cast": GDAction_9595C_9595CastObjects
, "Action_C_Comp": GDAction_9595C_9595CompObjects
, "Action_C_Range": GDAction_9595C_9595RangeObjects
, "Action_C_School": GDAction_9595C_9595SchoolObjects
, "Action_C_Name": GDAction_9595C_9595NameObjects
, "Action_C_Lv": GDAction_9595C_9595LvObjects
, "Action_Control": GDAction_9595ControlObjects
, "CardFrame": GDCardFrameObjects
, "Action_C_Target": GDAction_9595C_9595TargetObjects
, "Action_C_Target_tx": GDAction_9595C_9595Target_9595txObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Action_C_Img": thisGDAction_9595C_9595ImgObjectsList
, "Action_C_Duration": thisGDAction_9595C_9595DurationObjectsList
, "Action_C_Cast": thisGDAction_9595C_9595CastObjectsList
, "Action_C_Comp": thisGDAction_9595C_9595CompObjectsList
, "Action_C_Range": thisGDAction_9595C_9595RangeObjectsList
, "Action_C_School": thisGDAction_9595C_9595SchoolObjectsList
, "Action_C_Name": thisGDAction_9595C_9595NameObjectsList
, "Action_C_Lv": thisGDAction_9595C_9595LvObjectsList
, "Action_Control": thisGDAction_9595ControlObjectsList
, "CardFrame": thisGDCardFrameObjectsList
, "Action_C_Target": thisGDAction_9595C_9595TargetObjectsList
, "Action_C_Target_tx": thisGDAction_9595C_9595Target_9595txObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("ActionCard"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("ActionCard"),
  localVariables: [],
  getObjects: function(objectName) {
    return eventsFunctionContext._objectArraysMap[objectName] || [];
  },
  getObjectsLists: function(objectName) {
    return eventsFunctionContext._objectsMap[objectName] || null;
  },
  getBehaviorName: function(behaviorName) {
    return eventsFunctionContext._behaviorNamesMap[behaviorName] || behaviorName;
  },
  createObject: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    if (objectsList) {
      const object = parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
        parentEventsFunctionContext.createObject(objectsList.firstKey()) :
        runtimeScene.createObject(objectsList.firstKey());
      if (object) {
        objectsList.get(objectsList.firstKey()).push(object);
        if (!(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName))) {
          eventsFunctionContext._objectArraysMap[objectName].push(object);
        }
      }
      return object;
    }
    return null;
  },
  getInstancesCountOnScene: function(objectName) {
    const objectsList = eventsFunctionContext._objectsMap[objectName];
    let count = 0;
    if (objectsList) {
      for(const objectName in objectsList.items)
        count += parentEventsFunctionContext && !(scopeInstanceContainer && scopeInstanceContainer.isObjectRegistered(objectName)) ?
parentEventsFunctionContext.getInstancesCountOnScene(objectName) :
        runtimeScene.getInstancesCountOnScene(objectName);
    }
    return count;
  },
  getLayer: function(layerName) {
    return runtimeScene.getLayer(layerName);
  },
  getArgument: function(argName) {
if (argName === "Value") return Value;
    return "";
  },
  getOnceTriggers: function() { return that._onceTriggers; }
};

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595ImgObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595ImgObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595DurationObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595DurationObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CastObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CastObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CompObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595CompObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595RangeObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595RangeObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595SchoolObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595SchoolObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595NameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595NameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595LvObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595LvObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595ControlObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595ControlObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDCardFrameObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDCardFrameObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595TargetObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595TargetObjects2.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595Target_9595txObjects1.length = 0;
gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.SetTargetTypeContext.GDAction_9595C_9595Target_9595txObjects2.length = 0;


return;
}

gdjs.evtsExt__ActionCard__ActionCard.ActionCard.prototype.doStepPreEvents = function() {
  this._onceTriggers.startNewFrame();
};


gdjs.registerObject("ActionCard::ActionCard", gdjs.evtsExt__ActionCard__ActionCard.ActionCard);
