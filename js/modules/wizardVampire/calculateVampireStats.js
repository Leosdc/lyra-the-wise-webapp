/**
 * Calculates Vampire-specific character statistics based on generation and plugin values.
 * Mutates the template object.
 * 
 * @param {object} template - The template character sheet object.
 * @param {object} currentPlugin - The system plugin for Vampire.
 * @returns {object} The mutated template.
 */
export function calculateVampireStats(template, currentPlugin) {
    template.proficiencies_choice.saves = ['conscience', 'self_control', 'courage'];
    
    // Perform V20 specific stats calculation
    const calculated = currentPlugin.calculateStats(template);
    template.stats.hp_max = calculated.general.hp_max || 7;
    template.stats.hp_current = template.stats.hp_max;
    template.stats.willpower_max = calculated.general.willpower_max || 5;
    template.stats.willpower_current = template.stats.willpower_max;
    
    let bloodMax = 10;
    const genStr = String(template.bio.generation || "13ª Geração");
    if (genStr.includes("15ª") || genStr.includes("14ª") || genStr.includes("13ª")) bloodMax = 10;
    else if (genStr.includes("12ª")) bloodMax = 11;
    else if (genStr.includes("11ª")) bloodMax = 12;
    else if (genStr.includes("10ª")) bloodMax = 15;
    else if (genStr.includes("9ª")) bloodMax = 15;
    else if (genStr.includes("8ª")) bloodMax = 20;
    else if (genStr.includes("7ª")) bloodMax = 30;
    else if (genStr.includes("6ª")) bloodMax = 50;

    template.stats.blood_pool_max = bloodMax;
    template.stats.blood_pool_current = bloodMax;
    template.stats.speed = "Normal";

    return template;
}
