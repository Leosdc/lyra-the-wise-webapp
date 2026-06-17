import { renderVampAttrRow } from './renderVampAttrRow.js';
import { updateVampirePoints } from './updateVampirePoints.js';
import { bindVampireAttrEvents } from './bindVampireAttrEvents.js';
import { renderVampireAttributesGrid } from './renderVampireAttributesGrid.js';
import { validateVampireStep } from './validateVampireStep.js';
import { calculateVampireStats } from './calculateVampireStats.js';

export const WizardVampire = {
    renderVampAttrRow,
    updateVampirePoints,
    bindVampireAttrEvents,
    renderVampireAttributesGrid,
    validateVampireStep,
    calculateVampireStats
};

export default WizardVampire;
