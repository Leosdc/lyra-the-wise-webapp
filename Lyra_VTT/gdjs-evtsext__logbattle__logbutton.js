
gdjs.evtsExt__LogBattle__LogButton = gdjs.evtsExt__LogBattle__LogButton || {};

/**
 * Object generated from 
 */
gdjs.evtsExt__LogBattle__LogButton.LogButton = class LogButton extends gdjs.CustomRuntimeObject2D {
  constructor(parentInstanceContainer, objectData, instanceData) {
    super(parentInstanceContainer, objectData, instanceData);
    this._parentInstanceContainer = parentInstanceContainer;

    this._objectData = {};
    
    this._objectData.Origin = objectData.content.Origin !== undefined ? objectData.content.Origin : "";
    this._objectData.Type = objectData.content.Type !== undefined ? objectData.content.Type : "";
    this._objectData.Text = objectData.content.Text !== undefined ? objectData.content.Text : "";
    this._objectData.Content = objectData.content.Content !== undefined ? objectData.content.Content : "";
    this._objectData.Time = objectData.content.Time !== undefined ? objectData.content.Time : Number("") || 0;
    this._objectData.Size = objectData.content.Size !== undefined ? objectData.content.Size : Number("") || 0;
    

    // It calls the onCreated super implementation at the end.
    this.onCreated();
  }

  // Hot-reload:
  updateFromObjectData(oldObjectData, newObjectData) {
    super.updateFromObjectData(oldObjectData, newObjectData);
    if (oldObjectData.content.Origin !== newObjectData.content.Origin)
      this._objectData.Origin = newObjectData.content.Origin;
    if (oldObjectData.content.Type !== newObjectData.content.Type)
      this._objectData.Type = newObjectData.content.Type;
    if (oldObjectData.content.Text !== newObjectData.content.Text)
      this._objectData.Text = newObjectData.content.Text;
    if (oldObjectData.content.Content !== newObjectData.content.Content)
      this._objectData.Content = newObjectData.content.Content;
    if (oldObjectData.content.Time !== newObjectData.content.Time)
      this._objectData.Time = newObjectData.content.Time;
    if (oldObjectData.content.Size !== newObjectData.content.Size)
      this._objectData.Size = newObjectData.content.Size;

    this.onHotReloading(this._parentInstanceContainer);
    return true;
  }

  // Properties:
  
  _getOrigin() {
    return this._objectData.Origin !== undefined ? this._objectData.Origin : "";
  }
  _setOrigin(newValue) {
    this._objectData.Origin = newValue;
  }
  _getType() {
    return this._objectData.Type !== undefined ? this._objectData.Type : "";
  }
  _setType(newValue) {
    this._objectData.Type = newValue;
  }
  _getText() {
    return this._objectData.Text !== undefined ? this._objectData.Text : "";
  }
  _setText(newValue) {
    this._objectData.Text = newValue;
  }
  _getContent() {
    return this._objectData.Content !== undefined ? this._objectData.Content : "";
  }
  _setContent(newValue) {
    this._objectData.Content = newValue;
  }
  _getTime() {
    return this._objectData.Time !== undefined ? this._objectData.Time : Number("") || 0;
  }
  _setTime(newValue) {
    this._objectData.Time = newValue;
  }
  _getSize() {
    return this._objectData.Size !== undefined ? this._objectData.Size : Number("") || 0;
  }
  _setSize(newValue) {
    this._objectData.Size = newValue;
  }

  

  
}

// Methods:
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getContent();}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.Content = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.ContentContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.getObjects("Object")[0]._setContent(eventsFunctionContext.getArgument("Value"))
}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContent = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetContentContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getText();}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.Text = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TextContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(eventsFunctionContext.getObjects("Base_Panel_Log"), gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBase_9595Panel_9595LogObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Battle_Log_Iner"), gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects1);
gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDObjectObjects1);
{eventsFunctionContext.getObjects("Object")[0]._setText(eventsFunctionContext.getArgument("Value"))
}
{for(var i = 0, len = gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects1.length ;i < len;++i) {
    gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects1[i].setBBText(eventsFunctionContext.getArgument("Value"));
}
}
{for(var i = 0, len = gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBase_9595Panel_9595LogObjects1.length ;i < len;++i) {
    gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBase_9595Panel_9595LogObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Resizable")).setHeight((( gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects1.length === 0 ) ? 0 :gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects1[0].getHeight()) + 8);
}
}
{eventsFunctionContext.getObjects("Object")[0]._setSize((( gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects1.length === 0 ) ? 0 :gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects1[0].getHeight()) + 8)
}
{for(var i = 0, len = gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDObjectObjects1.length ;i < len;++i) {
    gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDObjectObjects1[i].getBehavior(eventsFunctionContext.getBehaviorName("Resizable")).setHeight(eventsFunctionContext.getObjects("Object")[0]._getSize());
}
}
}

}


{


let isConditionTrue_0 = false;
{
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetText = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTextContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getType();}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.Type = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TypeContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.getObjects("Object")[0]._setType(eventsFunctionContext.getArgument("Value"))
}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetType = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTypeContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getOrigin();}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.Origin = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.OriginContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return "" + eventsFunctionContext.returnValue;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.getObjects("Object")[0]._setOrigin(eventsFunctionContext.getArgument("Value"))
}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOrigin = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetOriginContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getTime();}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.Time = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.TimeContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.getObjects("Object")[0]._setTime(eventsFunctionContext.getArgument("Value"))
}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTime = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetTimeContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.returnValue = eventsFunctionContext.getObjects("Object")[0]._getSize();}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.Size = function(parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SizeContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return Number(eventsFunctionContext.returnValue) || 0;
}
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext = {};
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.idToCallbackMap = new Map();
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDObjectObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDObjectObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBattle_9595Log_9595InerObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBattle_9595Log_9595InerObjects2= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBase_9595Panel_9595LogObjects1= [];
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBase_9595Panel_9595LogObjects2= [];


gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{


let isConditionTrue_0 = false;
{
{eventsFunctionContext.getObjects("Object")[0]._setSize(eventsFunctionContext.getArgument("Value"))
}
}

}


};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSize = function(Value, parentEventsFunctionContext) {

var that = this;
var runtimeScene = this._instanceContainer;
let scopeInstanceContainer = this._instanceContainer;
var thisObjectList = [this];
var Object = Hashtable.newFrom({Object: thisObjectList});
var thisGDBattle_9595Log_9595InerObjectsList = [...runtimeScene.getObjects("Battle_Log_Iner")];
var GDBattle_9595Log_9595InerObjects = Hashtable.newFrom({"Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList});
var thisGDBase_9595Panel_9595LogObjectsList = [...runtimeScene.getObjects("Base_Panel_Log")];
var GDBase_9595Panel_9595LogObjects = Hashtable.newFrom({"Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList});
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
, "Battle_Log_Iner": GDBattle_9595Log_9595InerObjects
, "Base_Panel_Log": GDBase_9595Panel_9595LogObjects
},
  _objectArraysMap: {
"Object": thisObjectList
, "Battle_Log_Iner": thisGDBattle_9595Log_9595InerObjectsList
, "Base_Panel_Log": thisGDBase_9595Panel_9595LogObjectsList
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LogBattle"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LogBattle"),
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
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBase_9595Panel_9595LogObjects2.length = 0;

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDObjectObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDObjectObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBattle_9595Log_9595InerObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBattle_9595Log_9595InerObjects2.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBase_9595Panel_9595LogObjects1.length = 0;
gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.SetSizeContext.GDBase_9595Panel_9595LogObjects2.length = 0;


return;
}

gdjs.evtsExt__LogBattle__LogButton.LogButton.prototype.doStepPreEvents = function() {
  this._instanceContainer.getOnceTriggers().startNewFrame();
};


gdjs.registerObject("LogBattle::LogButton", gdjs.evtsExt__LogBattle__LogButton.LogButton);
