/* ============================================================
   Dizionari incorporati. SOLO dati: nessuna traduzione UI,
   nessuna logica. Le traduzioni stanno in i18n.js.
   ============================================================ */

/* Temi disponibili. "mixed" e' calcolato a runtime come unione. */
const KEYS = ["mixed","work","home","nature","food","hobby","tech","animals","travel","personal"];

/* Etichette dei dizionari incorporati (nomi delle lingue). */
const DICT_META = {
  it: { label: "Italiano" },
  en: { label: "English" }
};

/* Parole per lingua e tema (stringhe separate da spazio). */
const BUILTIN = {
  it:{
    work:"riunione progetto scrivania contratto fattura cliente scadenza report agenda badge stampante schermo tastiera codice server rete ufficio cartella documento firma timbro fascicolo dossier mansione turno pausa caffe verbale preventivo bilancio archivio collega capo stipendio bonifico ricevuta calendario lavagna telefono",
    home:"porta finestra tetto scala chiave lampada tavolo sedia letto cuscino armadio cassetto divano tappeto tenda specchio cucina forno frigo lavandino doccia balcone soffitta cantina corridoio camino mensola quadro vaso candela tovaglia coperta scaffale maniglia citofono campanello soglia ripostiglio garage",
    nature:"sole luna mare monte fiume lago bosco fiore albero vento neve pioggia stella nuvola prato roccia onda sabbia ghiaccio tuono fulmine alba tramonto nebbia rugiada cascata sentiero collina valle scogliera deserto palude foresta torrente seme foglia ramo radice",
    food:"pane mela pasta riso miele latte pizza formaggio oliva basilico limone ciliegia pera uva fico noce zucca patata carota cipolla aglio sale pepe burro brodo zuppa farina lievito crosta fetta torta gelato cioccolato biscotto marmellata insalata pomodoro",
    hobby:"chitarra pennello scacchi racchetta pallone bicicletta fotocamera romanzo modellino giardino pesca corsa nuoto scalata cucito ceramica origami acquerello tamburo flauto violino dado mazzo puzzle telescopio canna remo tenda zaino bussola mappa diario fumetto vinile cavalletto",
    tech:"resistore saldatore circuito sensore motore scheda cavo batteria filamento ugello condensatore transistor diodo antenna bobina morsetto dissipatore ventola modulo attuatore encoder stampante telaio cinghia puleggia vite dado rondella cuscinetto tester piano asse pinza chip memoria processore",
    animals:"gatto cane lupo volpe orso gufo ape pesce cavallo falco riccio talpa lontra cervo lepre topo corvo merlo rondine vespa ragno squalo balena delfino polpo granchio gambero aquila tasso furetto donnola scoiattolo cinghiale capriolo airone gabbiano",
    travel:"valigia mappa treno aereo biglietto passaporto albergo spiaggia citta confine dogana binario molo faro porto bussola sentiero rifugio tenda zaino borraccia souvenir cartolina frontiera traghetto vagone scalo terminal pedaggio autostrada",
    personal:"famiglia amico sorella fratello nonno sogno ricordo abbraccio sorriso viaggio lettera foto diario compleanno promessa segreto desiderio speranza coraggio pazienza affetto saluto regalo festa storia nome cuore mente anima respiro silenzio musica risata"
  },
  en:{
    work:"meeting project desk contract invoice client deadline report agenda badge printer screen keyboard code server network office folder document signature stamp file dossier task shift break coffee memo budget archive colleague boss salary payment receipt calendar whiteboard phone laptop",
    home:"door window roof stairs key lamp table chair bed pillow closet drawer couch carpet curtain mirror kitchen oven fridge sink shower balcony attic cellar hallway fireplace shelf frame vase candle blanket doormat handle doorbell garage",
    nature:"sun moon sea mountain river lake forest flower tree wind snow rain star cloud meadow rock wave sand ice thunder lightning dawn sunset fog dew waterfall trail hill valley cliff desert swamp stream seed leaf branch root",
    food:"bread apple pasta rice honey milk pizza cheese olive basil lemon cherry pear grape fig walnut pumpkin potato carrot onion garlic salt pepper butter broth soup flour yeast crust slice cake chocolate cookie jam salad tomato",
    hobby:"guitar brush chess racket ball bicycle camera novel model garden fishing running swimming climbing sewing pottery origami watercolor drum flute violin dice deck puzzle telescope reel oar tent backpack compass map diary comic vinyl easel",
    tech:"resistor solder circuit sensor motor board cable battery filament nozzle capacitor transistor diode antenna coil terminal heatsink fan module actuator encoder printer frame belt pulley screw nut washer bearing tester axis pliers chip memory processor",
    animals:"cat dog wolf fox bear owl bee fish horse hawk hedgehog mole otter deer hare mouse crow blackbird swallow wasp spider shark whale dolphin octopus crab shrimp eagle badger ferret weasel squirrel boar heron seagull",
    travel:"suitcase map train plane ticket passport hotel beach city border customs platform pier lighthouse port compass trail lodge tent backpack bottle souvenir postcard frontier ferry wagon layover terminal toll highway",
    personal:"family friend sister brother grandpa dream memory hug smile journey letter photo diary birthday promise secret wish hope courage patience affection greeting gift party story name heart mind soul breath silence music laughter"
  }
};
