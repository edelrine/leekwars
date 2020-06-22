//////////////////////////////////////////////////////////////////
///////////////////////////1)Constante
//////////////////////////////////////////////////////////////////
//////////////////////////bases//////////////////////////
function getFilledArray(size, value) {
	var array = [];
	for (var i = 0; i < size; i++) {
		push(array, value);
	}
	return array;
}

global _DEBUG_OPTI;
_DEBUG_OPTI = "";

function debugOpti(text){
	_DEBUG_OPTI += "["+floor((getOperations()/OPERATIONS_LIMIT)*100)+"%] "+ text + "\n";
}

global COLOR_NOIR = getColor(0, 0, 0); //Noir
global COLOR_ROUGE = getColor(255, 0, 0); //Rouge
global COLOR_BLEU = getColor(0, 112, 192); //Bleu
global COLOR_ROSE = getColor(250, 192, 144); //Rose
global COLOR_JAUNE = getColor(255, 255, 0); //Jaune
global COLOR_MARRON = getColor(151, 72, 7); //Marron
global COLOR_BLANC = getColor(255, 255, 255);
global COLOR_WARNING = COLOR_BLEU;

global INT_MAX = 999999999;
global INT_MIN = -999999999;
global INT_ZERO_PLUS = 0.00001;

//////////////////////////direction//////////////////////////
global LIGNE_HAUT = 0;
global LIGNE_BAS = 1;
global LIGNE_DROITE = 2;
global LIGNE_GAUCHE = 3;
global LIGNE_DIRECTION = [LIGNE_HAUT: [0, -1], LIGNE_BAS: [0, 1], LIGNE_DROITE: [1, 0], LIGNE_GAUCHE: [-1, 0]];
global DATA_DIRECTION_INVERSE = [LIGNE_HAUT: LIGNE_BAS, LIGNE_BAS: LIGNE_HAUT, LIGNE_GAUCHE: LIGNE_DROITE, LIGNE_DROITE: LIGNE_GAUCHE];
global LIGNE_DIRECTION_NOM = [LIGNE_HAUT: "haut", LIGNE_GAUCHE: "gauche", LIGNE_DROITE: "droit", LIGNE_BAS: "bas"];

//////////////////////////profiling et debugopti//////////////////////////
global TEXTT = 0, OPERATIONS = 1, CHILD_TEXT = 2, COLOR = COLOR_BLUE /*getColor(101, 101, 202)*/ ;
global _savedProfiles;
_savedProfiles = [];

global DEBUG_SCORE_ARME = ["arme", "cell cible", "valeur", "coef", "coef cible", "score"];
//////////////////////////Armes bases//////////////////////////
//accés à des information stockées dans DATA_ARME
global DATA_ARME;
global ARME_TYPE = 0;
global ARME_TYPE_CHIP = 0;
global ARME_TYPE_WEAPON = 1;
global ARME_USAGE = 1;
global ARME_USAGE_OFFENSIVE = 1;
global ARME_USAGE_DEFENSIVE = 2;
global ARME_USAGE_NEUTRE = 0;
global ARME_SCORE_MAX = INT_ZERO_PLUS;
global ARME_EFFECTS = 2;

global DATA_USE_NAME = [USE_CRITICAL: "USE_CRITICAL", USE_FAILED: "USE_FAILED", USE_INVALID_COOLDOWN: "USE_INVALID_COOLDOWN", USE_INVALID_POSITION: "USE_INVALID_POSITION", USE_INVALID_TARGET: "USE_INVALID_TARGET", USE_NOT_ENOUGH_TP: "USE_NOT_ENOUGH_TP", -6: "USE_RESURRECT_INVALID_ENTITY", USE_SUCCESS: "USE_SUCCESS", USE_TOO_MANY_SUMMONS: "USE_TOO_MANY_SUMMONS"];
global SCORE_ETAT_INITIALE;

//////////////////////////Data//////////////////////////
global DATA_VOISIN_OBSTACLE;
global DATA_VOISIN;
global DATA_VOISIN_VIDE;
global DATA_LOS = getFilledArray(614, 0);
global DATA_LOS_RANG = getFilledArray(614, getFilledArray(13, [-1]));
global DATA_LOS_RANG_LIGNE = getFilledArray(614, getFilledArray(13, -1));
global DATA_DISTANCES;

global DATA_AOE;
global DATA_AOE_SCORE;
global DATA_AOE_LIGNE;
global DATA_AOE_LIGNE_SCORE;
global DATA_MAP_SCORE_ANGLE;
global DATA_MAP_SCORE;
global DATA_SCORE_MAX = 0;
global DATA_SCORE_MIN = 0;
global DATA_MAP_SCORE_REPPLIS;
global DATA_MAP_SCORE_REPPLIS_MOYENNE = 0;
global DATA_MAP_SCORE_REPPLIS_MAX = 0;
global DATA_MAP_SCORE_OBSTACLE;
global DATA_LOS_ENEMIE;

//////////////////////////Même cell//////////////////////////
global LAST_GET_CELL = [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10];
LAST_GET_CELL[getTurn() % 10] = getCell();
function getCoefSameCell() {
	var score = 1;
	var fait = [];
	for (var cell in LAST_GET_CELL) {
		fait[cell] = 0;
	}
	return (1 - count(fait) / 10)**3;//[0;3]
}
debugOpti("coef même cell : \t" + getCoefSameCell());

//////////////////////////Action constantes//////////////////////////
global ACTION_SCORE_TOTAL = 0;
global ACTION_SCORE_ATTAQUE = 1;
global ACTION_SCORE_PLACEMENT = 2;
global ACTION_ARME = 3;
global ACTION_CELL_CIBLE = 4;
global ACTION_CELL_PLACEMENT = 5;

//////////////////////////Coefs//////////////////////////
//constantes
global COEF_GETLEEK = 1.2;
global COEF_LEEK = 1;
global COEF_BULBE = 0.8;
global COEF_ENEMIE = -1.1;
global COEF_ALLY = 1;
global COEF_MINIMUM_ACTION = 0.07;
global COEF_MINIMUM_REPPLIS = 1.5;
global COEF_AUTO_AFFECT = 0.9; //on multiplie par 0.9 si le score de l'attaque que l'on vas s'auto infliger
global COEF_LOS_GENERALE = 6;
global COEF_LOS_BULBES = -1;
global COEF_LOS_POIREAUX = -3;
global COEF_LOS_CAC = 2;
global STRENGTH_INIT = getStrength();
global COEF_COST = 0.0000001;//** coef_cost

//variables
global COEF_CENTRE = -0.1;
global COEF_ANGLE = 1;
global COEF_OBSTACLE_MAX = 1.5;
global COEF_OBSTACLE = 0.5;
global COEF_MP_RESTANT = 0.01;
global COEF_DISTANCE_MOYENNE;
global COEF_AGRESSIVITE;
global COEF_PLACEMENT;
global COEF_DISTANCE;
COEF_DISTANCE_MOYENNE = getMP(getNearestEnemy()) + 5;

if (getTurn() <= 16) {
	COEF_DISTANCE = (getLife() / getTotalLife() - 0.6) * -0.8;
} else if (getTurn() <= 40 or count(getAliveAllies()) > 3 or getFightContext() == FIGHT_CONTEXT_TOURNAMENT) {
	COEF_DISTANCE = (getLife() / getTotalLife() - 0.6) * -1 * (getTurn() / 32) * 8; // *= 1 tout les 5 tours
	COEF_DISTANCE_MOYENNE -= getTurn() / 16;
} else if (getTurn() <= 50) {
	COEF_DISTANCE = (getLife() / getTotalLife() - 0.6) * -2;
	COEF_DISTANCE_MOYENNE = 4;
} else{
	COEF_DISTANCE = -15;
	COEF_DISTANCE_MOYENNE = 0;
}

function GetAggresivite() {
	var score_tour = (getTurn()/45)**2;
	var score_ma_vie = (getLife()/getTotalLife())**2;
	var score_vie = ((getLife()/getTotalLife() - getLife(getNearestEnemy())/getTotalLife(getNearestEnemy()) + 1)/2)**2;
	var score_buff = getAbsoluteShield() / 50 + (getStrength()-STRENGTH_INIT)/40;
	if (score_buff > 1) {
		score_buff = 1;
	}
	score_buff = score_buff ** 2;
	var type_combat = 0.5;
	if (getFightType() == FIGHT_TYPE_FARMER or FIGHT_TYPE_TEAM) {
		if (count(getAliveAllies()) > 3) {
			type_combat = 1;
		}else{
			type_combat = 0.4;
		}
	}else if (getFightContext() == FIGHT_TYPE_BATTLE_ROYALE) {
		type_combat = 0.2;
	}
	var score = (score_ma_vie + score_vie + score_tour + score_buff + type_combat)/5;
	debugOpti("---Get aggresivitée ---");
	debugOpti("ma vie: \t"+(score_ma_vie));
	debugOpti("vie   : \t"+(score_vie));
	debugOpti("tour  : \t"+(score_tour));
	debugOpti("buff  : \t"+(score_buff));
	debugOpti("combat: \t"+(type_combat));
	debugOpti("total : \t"+score);
	debugOpti("-----------------------");

	return score;
}
COEF_AGRESSIVITE = GetAggresivite(); // 1 = agressif, 0 = defensif
debugOpti("coef agressivité : "+COEF_AGRESSIVITE);

debugOpti("coef distance original : \t" + COEF_DISTANCE);
COEF_DISTANCE *= 1+(getCoefSameCell())*2;
COEF_DISTANCE_MOYENNE -= (COEF_AGRESSIVITE+1) ** 2 + getCoefSameCell()*2;
if (COEF_DISTANCE_MOYENNE < 0) {
	COEF_DISTANCE_MOYENNE = 0;
}
debugOpti("coef distance : \t" + COEF_DISTANCE);
debugOpti("dist optimal  : \t"+COEF_DISTANCE_MOYENNE);
//0.8 -> 0.8 pour le placement, 0.2 pour l'attaque
COEF_PLACEMENT = 1-(getCoefSameCell()+COEF_AGRESSIVITE)/2;
debugOpti("coef placement : \t"+COEF_PLACEMENT);
if (COEF_PLACEMENT < 0.1) {
	COEF_PLACEMENT = 0.1;
	debugOpti("(W) : coef_placement < 0.1");
}
if (COEF_PLACEMENT > 0.9) {
	COEF_PLACEMENT = 0.9;
	debugOpti("(W) : coef_placement > 0.9");
}

//////////////////////////Mises en cache//////////////////////////
global COUNT_ENEMIE_LEEK = 0;
global COUNT_ALLIE_LEEK = 0;
global ALIVE_ENTITY = getAliveEnemies();
pushAll(ALIVE_ENTITY, getAliveAllies());
for (var leek in ALIVE_ENTITY) {
	var coef = (isSummon()) ? COEF_BULBE : COEF_LEEK;
	if (isAlly(leek)) {
		COUNT_ALLIE_LEEK += coef;
	} else {
		COUNT_ENEMIE_LEEK += coef;
	}
}

//////////////////////////Effet et type d'arme//////////////////////////
global ARMES_ON_CASTER = [];
global AREA_SIZE = [AREA_POINT:0, AREA_CIRCLE_1:1,AREA_CIRCLE_2:2,AREA_CIRCLE_3:3];
global EFFECT_OFFENSIVE = [EFFECT_ABSOLUTE_VULNERABILITY, EFFECT_DAMAGE, EFFECT_SHACKLE_MAGIC, EFFECT_SHACKLE_MP, EFFECT_SHACKLE_STRENGTH, EFFECT_SHACKLE_TP, EFFECT_POISON, EFFECT_POISON_TO_SCIENCE, EFFECT_NOVA_DAMAGE, EFFECT_NOVA_DAMAGE_TO_MAGIC];
global TYPE_ATTAQUE = 0;
global TYPE_SOIN = 1;
global TYPE_BOOST = 2;
global TYPE_PROTECTION = 3;
global TYPE_TACTIQUE = 4;
global TYPE_RENVOIE = 5;
global TYPE_POISON = 6;
global TYPE_BULBE = 7;
global TYPE_ENTRAVE = 8;

//////////////////////////Attaque//////////////////////////
global MALUS_CHANGEMENT_ARME =  0.99; // *= 0.99 si arme pas equipe

global CHIP_TYPE = [CHIP_ACCELERATION: TYPE_BOOST,
	CHIP_ADRENALINE: TYPE_BOOST,
	CHIP_ALTERATION: TYPE_ATTAQUE,
	CHIP_ANTIDOTE: TYPE_SOIN,
	CHIP_ARMOR: TYPE_PROTECTION,
	CHIP_ARMORING: TYPE_PROTECTION,
	CHIP_BALL_AND_CHAIN: TYPE_ENTRAVE,
	CHIP_BANDAGE: TYPE_SOIN,
	CHIP_BARK: TYPE_BOOST,
	CHIP_BURNING: TYPE_ATTAQUE,
	CHIP_CARAPACE: TYPE_PROTECTION,
	CHIP_COLLAR: TYPE_BOOST,
	CHIP_COVETOUSNESS: TYPE_BOOST,
	CHIP_CURE: TYPE_SOIN,
	CHIP_DEVIL_STRIKE: TYPE_ATTAQUE,
	CHIP_DOPING: TYPE_BOOST,
	CHIP_DRIP: TYPE_SOIN,
	CHIP_FEROCITY: TYPE_BOOST,
	CHIP_FERTILIZER: TYPE_SOIN,
	CHIP_FIRE_BULB: TYPE_BULBE,
	CHIP_FLAME: TYPE_ATTAQUE,
	CHIP_FLASH: TYPE_ATTAQUE,
	CHIP_FORTRESS: TYPE_PROTECTION,
	CHIP_FRACTURE: TYPE_ENTRAVE,
	CHIP_HEALER_BULB: TYPE_BULBE,
	CHIP_HELMET: TYPE_PROTECTION,
	CHIP_ICE: TYPE_ATTAQUE,
	CHIP_ICEBERG: TYPE_ATTAQUE,
	CHIP_ICED_BULB: TYPE_BULBE,
	CHIP_INVERSION: TYPE_TACTIQUE,
	CHIP_JUMP: TYPE_TACTIQUE,
	CHIP_LEATHER_BOOTS: TYPE_BOOST,
	CHIP_LIBERATION: TYPE_TACTIQUE,
	CHIP_LIGHTNING: TYPE_ATTAQUE,
	CHIP_LIGHTNING_BULB: TYPE_BULBE,
	CHIP_LOAM: TYPE_SOIN,
	CHIP_METALLIC_BULB: TYPE_BULBE,
	CHIP_METEORITE: TYPE_ATTAQUE,
	CHIP_MIRROR: TYPE_RENVOIE,
	CHIP_MOTIVATION: TYPE_BOOST,
	CHIP_PEBBLE: TYPE_ATTAQUE,
	CHIP_PLAGUE: TYPE_POISON,
	CHIP_PLASMA: TYPE_ATTAQUE,
	CHIP_PRECIPITATION: TYPE_BOOST,
	CHIP_PROTEIN: TYPE_BOOST,
	CHIP_PUNISHMENT: TYPE_ATTAQUE,
	CHIP_PUNY_BULB: TYPE_BULBE,
	CHIP_RAGE: TYPE_BOOST,
	CHIP_RAMPART: TYPE_PROTECTION,
	CHIP_REFLEXES: TYPE_BOOST,
	CHIP_REGENERATION: TYPE_SOIN,
	CHIP_REMISSION: TYPE_SOIN,
	CHIP_RESURRECTION: TYPE_SOIN,
	CHIP_ROCK: TYPE_ATTAQUE,
	CHIP_ROCKFALL: TYPE_ATTAQUE,
	CHIP_ROCKY_BULB: TYPE_BULBE,
	CHIP_SEVEN_LEAGUE_BOOTS: TYPE_BOOST,
	CHIP_SHIELD: TYPE_PROTECTION,
	CHIP_SHOCK: TYPE_ATTAQUE,
	CHIP_SLOW_DOWN: TYPE_ENTRAVE,
	CHIP_SOLIDIFICATION: TYPE_PROTECTION,
	CHIP_SOPORIFIC: TYPE_ENTRAVE,
	CHIP_SPARK: TYPE_ATTAQUE,
	CHIP_STALACTITE: TYPE_ATTAQUE,
	CHIP_STEROID: TYPE_BOOST,
	CHIP_STRETCHING: TYPE_BOOST,
	CHIP_TELEPORTATION: TYPE_TACTIQUE,
	CHIP_THORN: TYPE_RENVOIE,
	CHIP_TOXIN: TYPE_POISON,
	CHIP_TRANQUILIZER: TYPE_ENTRAVE,
	CHIP_VACCINE: TYPE_SOIN,
	CHIP_VAMPIRIZATION: TYPE_SOIN,
	CHIP_VENOM: TYPE_POISON,
	CHIP_WALL: TYPE_PROTECTION,
	CHIP_WARM_UP: TYPE_BOOST,
	CHIP_WHIP: TYPE_BOOST,
	CHIP_WINGED_BOOTS: TYPE_BOOST,
	CHIP_WIZARD_BULB: TYPE_BULBE
];

global EFFECT_NAME = [EFFECT_ABSOLUTE_SHIELD: "ABSOLUTE_SHIELD",
	EFFECT_ABSOLUTE_VULNERABILITY: "ABSOLUTE_VULNERABILITY",
	EFFECT_ABSOLUTE_VULNERABILITY: "ABSOLUTE_VULNERABILITY",
	EFFECT_AFTEREFFECT: "AFTEREFFECT",
	EFFECT_ANTIDOTE: "ANTIDOTE",
	EFFECT_BOOST_MAX_LIFE: "BOOST_MAX_LIFE",
	EFFECT_BUFF_AGILITY: "BUFF_AGILITY",
	EFFECT_BUFF_FORCE: "BUFF_FORCE",
	EFFECT_BUFF_MP: "BUFF_MP",
	EFFECT_BUFF_RESISTANCE: "BUFF_RESISTANCE",
	EFFECT_BUFF_STRENGTH: "BUFF_STRENGTH",
	EFFECT_BUFF_TP: "BUFF_TP",
	EFFECT_BUFF_WISDOM: "BUFF_WISDOM",
	EFFECT_DAMAGE: "DAMAGE",
	EFFECT_DAMAGE_RETURN: "DAMAGE_RETURN",
	EFFECT_DAMAGE_TO_ABSOLUTE_SHIELD: "DAMAGE_TO_ABSOLUTE_SHIELD",
	EFFECT_DAMAGE_TO_STRENGTH: "DAMAGE_TO_STRENGTH",
	EFFECT_DEBUFF: "DEBUFF",
	EFFECT_HEAL: "HEAL",
	EFFECT_INVERT: "INVERT",
	EFFECT_KILL: "KILL",
	EFFECT_LIFE_DAMAGE: "LIFE_DAMAGE",
	EFFECT_NOVA_DAMAGE: "NOVA_DAMAGE",
	EFFECT_NOVA_DAMAGE_TO_MAGIC: "NOVA_DAMAGE_TO_MAGIC",
	EFFECT_POISON: "POISON",
	EFFECT_POISON_TO_SCIENCE: "POISON_TO_SCIENCE",
	EFFECT_RAW_ABSOLUTE_SHIELD: "RAW_ABSOLUTE_SHIELD",
	EFFECT_RAW_BUFF_AGILITY: "RAW_BUFF_AGILITY",
	EFFECT_RAW_BUFF_MAGIC: "RAW_BUFF_MAGIC",
	EFFECT_RAW_BUFF_MP: "RAW_BUFF_MP",
	EFFECT_RAW_BUFF_SCIENCE: "RAW_BUFF_SCIENCE",
	EFFECT_RAW_BUFF_STRENGTH: "RAW_BUFF_STRENGTH",
	EFFECT_RAW_BUFF_TP: "RAW_BUFF_TP",
	EFFECT_RELATIVE_SHIELD: "RELATIVE_SHIELD",
	EFFECT_RESURRECT: "RESURRECT",
	EFFECT_SHACKLE_MAGIC: "SHACKLE_MAGIC",
	EFFECT_SHACKLE_MP: "SHACKLE_MP",
	EFFECT_SHACKLE_STRENGTH: "SHACKLE_STRENGTH",
	EFFECT_SHACKLE_TP: "SHACKLE_TP",
	EFFECT_STEAL_ABSOLUTE_SHIELD: "STEAL_ABSOLUTE_SHIELD",
	EFFECT_SUMMON: "SUMMON",
	EFFECT_TELEPORT: "TELEPORT",
	EFFECT_VULNERABILITY: "VULNERABILITY"
];

global EFFECT_TARGET_NAME = [
	EFFECT_TARGET_ALLIES: "EFFECT_TARGET_ALLIES",
	EFFECT_TARGET_ALWAYS_CASTER: "EFFECT_TARGET_ALWAYS_CASTER",
	EFFECT_TARGET_ENEMIES: "EFFECT_TARGET_ENEMIES",
	EFFECT_TARGET_ENEMIES: "EFFECT_TARGET_ENEMIES",
	EFFECT_TARGET_NON_SUMMONS: "EFFECT_TARGET_NON_SUMMONS",
	EFFECT_TARGET_NOT_CASTER: "EFFECT_TARGET_NOT_CASTER",
	EFFECT_TARGET_SUMMONS: "EFFECT_TARGET_SUMMONS"
];

DATA_ARME = [1: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 5, 7, 0, 31, 0]
]], 2: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 17, 19, 0, 31, 0]
]], 3: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[2, 10, 15, 0, 31, 0]
]], 4: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[2, 35, 43, 0, 31, 0]
]], 5: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 25, 27, 0, 31, 0]
]], 6: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 19, 24, 0, 31, 0]
]], 7: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 30, 31, 0, 31, 0]
]], 8: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[3, 30, 35, 2, 30, 0],
	[25, 30, 35, 0, 30, 0]
]], 9: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[4, 30, 35, 2, 30, 0]
]], 10: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[2, 35, 40, 0, 31, 0]
]], 11: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[2, 34, 38, 3, 30, 0]
]], 12: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[7, 0, 5, 0, 6, 1, 30, 0]
]], 13: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[7, 0, 5, 0, 6, 3, 14, 0]
]], 14: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[7, 0, 4, 0, 5, 2, 30, 0]
]], 15: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[8, 0, 4, 0, 5, 2, 30, 0],
	[26, 6, 6, 2, 26, 0]
]], 16: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[8, 0, 5, 0, 6, 3, 30, 0],
	[26, 8, 8, 3, 30, 0]
]], 17: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[8, 0, 5, 0, 6, 3, 14, 0],
	[26, 10, 10, 3, 10, 0]
]], 18: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 8, 16, 0, 31, 0]
]], 19: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 2, 34, 0, 31, 0]
]], 20: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[6, 20, 20, 3, 30, 0]
]], 21: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[6, 15, 15, 2, 30, 0]
]], 22: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[6, 25, 25, 4, 30, 0]
]], 23: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[5, 5, 6, 2, 30, 0]
]], 24: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[5, 9, 10, 3, 22, 0],
	[5, 5, 6, 3, 14, 0]
]], 25: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[3, 35, 40, 3, 30, 0],
	[25, 35, 40, 3, 30, 0]
]], 26: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[3, 40, 45, 3, 30, 0],
	[25, 40, 45, 0, 30, 0]
]], 27: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[4, 35, 40, 3, 30, 0]
]], 28: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[4, 40, 45, 3, 30, 0]
]], 29: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[5, 8, 9, 3, 30, 0]
]], 30: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 64, 67, 0, 31, 0]
]], 31: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 82, 90, 0, 31, 0]
]], 32: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 48, 56, 0, 31, 0]
]], 33: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 35, 47, 0, 27, 0]
]], 34: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[9, 60, 60, 0, 31, 0]
]], 35: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[2, 200, 200, 0, 31, 0]
]], 36: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 70, 80, 0, 31, 0]
]], 37: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 15, 20, 0, 31, 0]
]], 38: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 10, 15, 0, 31, 0],
	[1, 10, 15, 0, 31, 0],
	[1, 10, 15, 0, 31, 0]
]], 39: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 18, 25, 0, 31, 0],
	[13, 7, 10, 2, 31, 1]
]], 40: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 40, 60, 0, 31, 0],
	[19, 12, 12, 2, 31, 1]
]], 41: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 33, 43, 0, 31, 0],
	[27, 20, 20, 1, 31, 1]
]], 42: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 43, 59, 0, 31, 0]
]], 43: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 45, 53, 0, 31, 0]
]], 44: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 70, 80, 0, 31, 0]
]], 45: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 25, 40, 0, 31, 0]
]], 46: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 35, 40, 0, 31, 0],
	[13, 24, 30, 2, 31, 1]
]], 47: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 90, 100, 0, 31, 0]
]], 48: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[13, 27, 32, 3, 31, 1]
]], 59: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[10, 0, 0, 0, 31, 0]
]], 60: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 50, 60, 0, 31, 0],
	[2, 50, 60, 0, 31, 0]
]], 67: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[12, 25, 30, 0, 31, 0]
]], 68: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[11, 0, 0, 0, 31, 0],
	[2, 50, 50, 0, 30, 0],
	[26, 20, 20, 1, 29, 1]
]], 73: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[14, 1, 1, 0, 31, 0]
]], 74: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[14, 2, 2, 0, 31, 0]
]], 75: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[14, 3, 3, 0, 31, 0]
]], 76: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[14, 4, 4, 0, 31, 0]
]], 77: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[14, 5, 5, 0, 31, 0]
]], 78: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[14, 6, 6, 0, 31, 0]
]], 79: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[14, 7, 7, 0, 31, 0]
]], 80: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[2, 66, 77, 0, 30, 0]
]], 81: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[6, 55, 55, 3, 22, 0],
	[6, 15, 20, 3, 14, 0]
]], 84: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[15, 0, 0, 0, 31, 0]
]], 85: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 25, 25, 0, 31, 0],
	[1, 25, 25, 0, 31, 0],
	[1, 25, 25, 0, 31, 0],
	[1, 25, 25, 0, 31, 0],
	[1, 25, 25, 0, 31, 0]
]], 88: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[8, 0, 7, 0, 8, 2, 22, 0]
]], 89: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[12, 35, 40, 0, 22, 0],
	[12, 10, 15, 0, 10, 0]
]], 90: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[12, 80, 90, 0, 22, 0]
]], 91: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[7, 0, 7, 0, 8, 2, 22, 0]
]], 92: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[17, 0, 3, 0, 4, 1, 31, 1]
]], 93: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[17, 0, 4, 0, 5, 3, 31, 1]
]], 94: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[18, 0, 3, 0, 4, 1, 31, 1]
]], 95: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[18, 0, 4, 0, 5, 3, 31, 1]
]], 96: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[21, 50, 60, 3, 30, 0]
]], 97: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[13, 15, 20, 3, 31, 1]
]], 98: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[13, 25, 35, 3, 31, 1]
]], 99: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[13, 40, 50, 4, 31, 1]
]], 100: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[20, 3, 4, 3, 30, 0]
]], 101: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[20, 5, 6, 3, 30, 0]
]], 102: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[3, 60, 70, 2, 22, 0]
]], 103: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[22, 60, 70, 2, 22, 0]
]], 104: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[21, 60, 70, 2, 22, 0]
]], 105: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 78, 87, 0, 17, 0],
	[13, 78, 87, 1, 17, 0],
	[16, 0, 0, 0, 22, 0]
]], 106: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[19, 20, 25, 2, 31, 1],
	[24, 20, 25, 2, 31, 1]
]], 107: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 77, 77, 0, 31, 0],
	[19, 10, 10, 1, 31, 1],
	[17, 0, 2, 0, 3, 1, 31, 1],
	[18, 0, 2, 0, 3, 1, 31, 1]
]], 108: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 39, 41, 0, 31, 0],
	[3, 30, 30, 2, 31, 5]
]], 109: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 44, 77, 0, 31, 0],
	[17, 0, 5, 0, 6, 1, 31, 1]
]], 110: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[23, 0, 0, 0, 30, 0]
]], 114: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[28, 33, 333, 33, 333, 0, 31, 0],
	[28, 66, 667, 66, 667, 0, 31, 4]
]], 115: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[27, 20, 20, 2, 31, 1],
	[29, 20, 20, 2, 31, 5]
]], 116: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 10, 10, 0, 31, 0],
	[1, 10, 10, 0, 31, 0],
	[1, 10, 10, 0, 31, 0],
	[1, 10, 10, 0, 31, 0]
]], 117: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[30, 34, 40, 0, 31, 0],
	[26, 7, 7, 2, 31, 0]
]], 118: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[1, 69, 73, 0, 31, 0]
]], 119: [ARME_TYPE_WEAPON, ARME_USAGE_OFFENSIVE, [
	[13, 60, 70, 2, 31, 1]
]], 120: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[32, 1, 1, 2, 29, 6]
]], 121: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[2, 38, 40, 0, 29, 6]
]], 122: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[31, 1, 1, 1, 29, 6]
]], 141: [ARME_TYPE_CHIP, ARME_USAGE_DEFENSIVE, [
	[30, 18, 20, 0, 31, 0]
]], 142: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[14, 8, 8, 0, 31, 0]
]], 143: [ARME_TYPE_CHIP, ARME_USAGE_OFFENSIVE, [
	[1, 35, 37, 0, 31, 2]
]], 144: [ARME_TYPE_CHIP, ARME_USAGE_NEUTRE, [
	[10, 0, 0, 0, 31, 0],
	[41, 100, 100, 2, 31, 4]
]]];