
if (typeof gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize !== "undefined") {
  gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.registeredGdjsCallbacks.forEach(callback =>
    gdjs._unregisterCallback(callback)
  );
}

gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize = {};
gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.idToCallbackMap = new Map();
gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.GDObjectObjects1= [];


gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.userFunc0x161ebb0 = function GDJSInlineCode(runtimeScene, objects, eventsFunctionContext) {
"use strict";
const url = eventsFunctionContext.getArgument("URL");
const isBase = eventsFunctionContext.getArgument("ChangeResource");

// Cria a textura a partir da URL
const texture = isBase ? PIXI.BaseTexture.from(url) : PIXI.Texture.from(url);

for (const obj of objects) {
    const sprite = obj.getRendererObject();
    
    if (isBase) {
        sprite.texture.baseTexture = texture;
    } else {
        sprite.texture = texture;
    }

    const baseTex = isBase ? texture : texture.baseTexture;

    // Função interna para aplicar as dimensões reais da imagem
    const resizeToTexture = () => {
        // Pegamos a largura e altura REAIS da imagem carregada
        const newWidth = baseTex.width;
        const newHeight = baseTex.height;
        
        obj.setWidth(newWidth);
        obj.setHeight(newHeight);
        
        // Avisa ao motor do GDevelop que a colisão mudou
        obj.hitBoxesDirty = true; 
    };

    if (baseTex.hasLoaded) {
        resizeToTexture();
    } else {
        baseTex.once('loaded', () => {
            resizeToTexture();
        });
    }
}
};
gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.eventsList0 = function(runtimeScene, eventsFunctionContext) {

{

gdjs.copyArray(eventsFunctionContext.getObjects("Object"), gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.GDObjectObjects1);

const objects = gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.GDObjectObjects1;
gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.userFunc0x161ebb0(runtimeScene, objects, eventsFunctionContext);

}


};

gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.func = function(runtimeScene, URL, Object, ChangeResource, parentEventsFunctionContext) {
let scopeInstanceContainer = null;
var eventsFunctionContext = {
  _objectsMap: {
"Object": Object
},
  _objectArraysMap: {
"Object": gdjs.objectsListsToArray(Object)
},
  _behaviorNamesMap: {
},
  globalVariablesForExtension: runtimeScene.getGame().getVariablesForExtension("LoadImageFromURL"),
  sceneVariablesForExtension: runtimeScene.getScene().getVariablesForExtension("LoadImageFromURL"),
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
if (argName === "URL") return URL;
if (argName === "ChangeResource") return ChangeResource;
    return "";
  },
  getOnceTriggers: function() { return runtimeScene.getOnceTriggers(); }
};

gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.GDObjectObjects1.length = 0;

gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.eventsList0(runtimeScene, eventsFunctionContext);
gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.GDObjectObjects1.length = 0;


return;
}

gdjs.evtsExt__LoadImageFromURL__LoadURLIntoSpriteImgSize.registeredGdjsCallbacks = [];