const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    rooms: rooms.size,
    uptime: process.uptime()
  });
});

const DIFFICULTY_SETTINGS = {
  facil: {
    label: "FÃ¡cil",
    startingStats: {
      ingredientes: 75,
      paciencia: 75,
      caos: 15,
      hallacas: 0
    },
    pressure: null
  },
  dificil: {
    label: "DifÃ­cil",
    startingStats: {
      ingredientes: 70,
      paciencia: 70,
      caos: 20,
      hallacas: 0
    },
    pressure: { caos: 3, paciencia: -1 }
  }
};


const WIN_HALLACAS = 100;

const specialBillScenario = {
  id: "la_apuesta_del_tio",
  title: "La Apuesta del Tío",
  description:
    "El tío aparece con una idea peligrosísima para resolver la noche: conseguir un billete de $100. Nadie sabe exactamente de dónde salió el plan, pero todos saben que puede salir muy bien... o muy mal.",
  isSpecialBill: true,
  choices: [
    {
      id: "organizar_pelea_de_gallos",
      text: "Organizar pelea de gallos",
      consequence: "El plan solo trajo gritos, plumas imaginarias y más caos. Del billete, ni rastro.",
      winConsequence: "El plan fue raro, ruidoso y sorprendentemente efectivo: el tío apareció con un billete de $100.",
      billChance: 0.7,
      effects: { caos: 10 }
    },
    {
      id: "vender_aceitunas",
      text: "Vender las aceitunas",
      consequence: "Se fueron las aceitunas, pero no llegó ningún billete. Ahora las hallacas tienen menos personalidad.",
      winConsequence: "Vendieron más aceitunas de las que debían, pero apareció el billete de $100. La familia celebra con sospecha.",
      billChance: 0.4,
      effects: { ingredientes: -10, paciencia: -5 }
    },
    {
      id: "seguir_trabajando",
      text: "Seguir trabajando",
      consequence: "La familia decide no meterse en inventos raros. La cocina se calma y la producción avanza.",
      billChance: 0,
      effects: { caos: -10, hallacas: 10 }
    }
  ]
};

const scenarios = [
  {
    id: "el_guiso_se_pega",
    title: "El guiso se pega",
    description: "La olla empieza a oler raro. Alguien grita desde la cocina: \"¡Eso se está pegando!\"",
    choices: [
      {
        id: "raspar_y_seguir",
        text: "Raspar y seguir",
        consequence: "Salvan parte del guiso, pero el sabor queda sospechoso y todos se estresan.",
        effects: { hallacas: 8, paciencia: -10, caos: 6 }
      },
      {
        id: "bajar_el_fuego",
        text: "Bajar el fuego y esperar",
        consequence: "El guiso se salva, pero la producción se pone lenta y la presión sube.",
        effects: { hallacas: 4, caos: 6 }
      },
      {
        id: "hacer_guiso_nuevo",
        text: "Hacer guiso nuevo",
        consequence: "La calidad mejora, pero se gastan ingredientes valiosos.",
        effects: { ingredientes: -15, paciencia: -6, hallacas: 6 }
      }
    ]
  },
  {
    id: "se_fue_la_luz",
    title: "Se fue la luz",
    description: "La cocina queda a oscuras justo cuando alguien estaba midiendo la masa.",
    choices: [
      {
        id: "seguir_con_linterna",
        text: "Seguir con linterna",
        consequence: "Avanzan como pueden, pero la cocina parece una misión imposible.",
        effects: { hallacas: 7, caos: 12, paciencia: -8 }
      },
      {
        id: "prender_velas",
        text: "Prender velas",
        consequence: "La luz mejora el ánimo, aunque se pierde tiempo organizando todo.",
        effects: { hallacas: 4, paciencia: 8, caos: 8 }
      },
      {
        id: "esperar_que_vuelva",
        text: "Esperar que vuelva",
        consequence: "Nadie se equivoca con la receta, pero la impaciencia empieza a mandar.",
        effects: { caos: 8, hallacas: 2 }
      }
    ]
  },
  {
    id: "perro_robo_masa",
    title: "El perro robó masa",
    description: "El perro aparece con cara de inocente y una bola de masa en la boca.",
    choices: [
      {
        id: "perseguir_perro",
        text: "Perseguir al perro",
        consequence: "Recuperan algo de masa, pero la persecución vuelve loca la casa.",
        effects: { ingredientes: -6, caos: 14, hallacas: 6 }
      },
      {
        id: "hacer_mas_masa",
        text: "Hacer más masa",
        consequence: "Reponen lo perdido, pero se van ingredientes y paciencia.",
        effects: { ingredientes: -14, paciencia: -8, hallacas: 8 }
      },
      {
        id: "encerrar_perro",
        text: "Encerrar al perro",
        consequence: "El peligro canino queda controlado, pero todos pierden tiempo.",
        effects: { caos: -2, hallacas: 3 }
      }
    ]
  },
  {
    id: "tia_quiere_mandar",
    title: "La tía quiere mandar",
    description: "Una tía toma el mando y declara que todo se está haciendo mal.",
    choices: [
      {
        id: "dejarla_dirigir",
        text: "Dejarla dirigir",
        consequence: "La producción se ordena, pero nadie se salva del regaño.",
        effects: { hallacas: 10, paciencia: -14, caos: -4 }
      },
      {
        id: "negociar_con_ella",
        text: "Negociar con ella",
        consequence: "Acepta supervisar sin gritar tanto, aunque el ritmo baja.",
        effects: { hallacas: 5, paciencia: 8, caos: 8 }
      },
      {
        id: "distraerla_con_cafe",
        text: "Distraerla con café",
        consequence: "La tía se calma un rato, pero alguien tiene que atenderla.",
        effects: { paciencia: 12, ingredientes: -5, hallacas: 3 }
      }
    ]
  },
  {
    id: "vecinos_sin_avisar",
    title: "Llegaron vecinos sin avisar",
    description: "Tocan la puerta. Son los vecinos, felices, hambrientos y sin traer nada.",
    choices: [
      {
        id: "ponerlos_a_trabajar",
        text: "Ponerlos a trabajar",
        consequence: "Ayudan bastante, pero convierten la cocina en una fiesta.",
        effects: { hallacas: 11, caos: 12, ingredientes: -6 }
      },
      {
        id: "servirles_cafe",
        text: "Servirles café",
        consequence: "La visita se mantiene tranquila, pero se gastan recursos.",
        effects: { paciencia: 8, ingredientes: -10, hallacas: 4 }
      },
      {
        id: "cerrar_la_puerta_suave",
        text: "Cerrar suavecito",
        consequence: "La familia se concentra, aunque queda un ambiente raro.",
        effects: { caos: -8, paciencia: -8, hallacas: 6 }
      }
    ]
  },
  {
    id: "se_acabo_pabilo",
    title: "Se acabó el pabilo",
    description: "Alguien levanta el rollito vacío. Sin pabilo, no hay amarre digno.",
    choices: [
      {
        id: "buscar_en_gavetas",
        text: "Buscar en gavetas",
        consequence: "Aparece un pabilo viejo, pero la búsqueda desordena todo.",
        effects: { hallacas: 7, caos: 10, paciencia: -6 }
      },
      {
        id: "pedir_al_vecino",
        text: "Pedir al vecino",
        consequence: "El vecino presta pabilo, pero se queda conversando demasiado.",
        effects: { hallacas: 6, caos: 8, paciencia: -4 }
      },
      {
        id: "comprar_rapido",
        text: "Comprar rápido",
        consequence: "Resuelven el problema, pero gastan plata e ingredientes de merienda.",
        effects: { ingredientes: -12, caos: -6, hallacas: 5 }
      }
    ]
  },
  {
    id: "nadie_lavo_hojas",
    title: "Nadie lavó las hojas",
    description: "Las hojas de plátano siguen en una bolsa, mirándolos con juicio.",
    choices: [
      {
        id: "lavado_express",
        text: "Lavado express",
        consequence: "Las hojas quedan usables, pero la cocina termina empapada.",
        effects: { hallacas: 8, caos: 10, paciencia: -6 }
      },
      {
        id: "hacer_equipo_de_lavado",
        text: "Armar equipo",
        consequence: "La familia se coordina mejor, pero la producción se atrasa.",
        effects: { hallacas: 5, paciencia: 8, caos: 8 }
      },
      {
        id: "usar_las_mejores",
        text: "Usar las mejores",
        consequence: "Avanzan con menos hojas, sacrificando cantidad.",
        effects: { hallacas: 6, ingredientes: -12, caos: -4 }
      }
    ]
  },
  {
    id: "nino_tumbo_bandeja",
    title: "El niño tumbó la bandeja",
    description: "Una bandeja cae al piso en cámara lenta. Todos gritan como si fuera final de novela.",
    choices: [
      {
        id: "rescatar_lo_posible",
        text: "Rescatar lo posible",
        consequence: "Salvan parte del trabajo, pero nadie queda emocionalmente estable.",
        effects: { hallacas: 6, paciencia: -14, caos: 12 }
      },
      {
        id: "limpiar_y_rehacer",
        text: "Limpiar y rehacer",
        consequence: "La cocina se recupera, pero se pierden ingredientes y tiempo.",
        effects: { ingredientes: -12, caos: 8, hallacas: 5 }
      },
      {
        id: "darle_tarea_segura",
        text: "Darle tarea segura",
        consequence: "El niño ayuda contando hojas, pero alguien debe supervisarlo.",
        effects: { paciencia: 8, hallacas: 4, caos: 6 }
      }
    ]
  },
  {
    id: "demasiadas_pasas",
    title: "Demasiadas pasas",
    description: "Alguien puso pasas como si estuviera decorando un arbolito.",
    choices: [
      {
        id: "aceptar_destino",
        text: "Aceptar el destino",
        consequence: "La producción avanza, pero empieza el debate nacional familiar.",
        effects: { hallacas: 9, paciencia: -12, caos: 8 }
      },
      {
        id: "quitar_pasas",
        text: "Quitar pasas",
        consequence: "Corrigen la receta, pero todos pierden tiempo y calma.",
        effects: { hallacas: 4, caos: 6 }
      },
      {
        id: "hacer_mitad_y_mitad",
        text: "Mitad y mitad",
        consequence: "Nadie queda feliz del todo, pero la paz sobrevive.",
        effects: { hallacas: 6, paciencia: 6, ingredientes: -6 }
      }
    ]
  },
  {
    id: "abuelo_historia_larga",
    title: "El abuelo empezó una historia",
    description: "El abuelo dice: \"Eso me recuerda a 1978...\" y nadie sabe cuándo termina.",
    choices: [
      {
        id: "escuchar_con_carino",
        text: "Escuchar con cariño",
        consequence: "La familia se enternece, pero la mesa queda parada.",
        effects: { paciencia: 12, caos: 12, hallacas: 2 }
      },
      {
        id: "trabajar_mientras_habla",
        text: "Trabajar escuchando",
        consequence: "Avanzan lento entre anécdotas y correcciones históricas.",
        effects: { hallacas: 6, paciencia: 4, caos: 6 }
      },
      {
        id: "poner_musica",
        text: "Poner música",
        consequence: "La historia se corta, pero el volumen sube demasiado.",
        effects: { hallacas: 7, caos: 10, paciencia: -6 }
      }
    ]
  },
  {
    id: "delivery_no_llego",
    title: "El delivery nunca llegó",
    description: "La comida para aguantar la jornada sigue \"en camino\" desde hace una hora.",
    choices: [
      {
        id: "seguir_sin_comer",
        text: "Seguir sin comer",
        consequence: "La familia avanza, pero la ansiedad se pone peligrosa.",
        effects: { hallacas: 10, caos: 18, paciencia: -8 }
      },
      {
        id: "picar_algo",
        text: "Picar algo",
        consequence: "Baja la tensión, pero se gastan ingredientes que eran para la receta.",
        effects: { caos: -12, ingredientes: -12, hallacas: 4 }
      },
      {
        id: "mandar_a_buscar",
        text: "Mandar a buscar",
        consequence: "Alguien sale a resolver, pero falta un par de manos.",
        effects: { caos: 0, hallacas: 5 }
      }
    ]
  },
  {
    id: "olla_pequena",
    title: "La olla es demasiado pequeña",
    description: "El guiso no cabe. La olla parece de juguete y nadie quiere admitirlo.",
    choices: [
      {
        id: "cocinar_por_tandas",
        text: "Cocinar por tandas",
        consequence: "Sale mejor controlado, pero la noche se alarga.",
        effects: { hallacas: 6, caos: 8 }
      },
      {
        id: "llenarla_hasta_arriba",
        text: "Llenarla hasta arriba",
        consequence: "Avanzan rápido, pero todo amenaza con desbordarse.",
        effects: { hallacas: 10, caos: 16, paciencia: -6 }
      },
      {
        id: "pedir_olla_prestada",
        text: "Pedir olla prestada",
        consequence: "Consiguen una olla grande, pero viene con visita incluida.",
        effects: { hallacas: 8, ingredientes: -5, caos: 8 }
      }
    ]
  },
  {
    id: "pelea_por_amarre",
    title: "Pelea por el amarre",
    description: "Dos personas aseguran que su técnica de amarrar es la única respetable.",
    choices: [
      {
        id: "competencia_rapida",
        text: "Hacer competencia",
        consequence: "Amarran muchas hallacas, pero el orgullo queda tocado.",
        effects: { hallacas: 12, paciencia: -16, caos: 8 }
      },
      {
        id: "elegir_un_metodo",
        text: "Elegir un método",
        consequence: "La mesa se ordena, aunque alguien queda resentido.",
        effects: { hallacas: 8, paciencia: -8, caos: -6 }
      },
      {
        id: "turnarse",
        text: "Turnarse",
        consequence: "La paz se mantiene, pero el ritmo baja.",
        effects: { hallacas: 5, paciencia: 10, caos: 8 }
      }
    ]
  },
  {
    id: "whatsapp_exploto",
    title: "El WhatsApp explotó",
    description: "El grupo familiar manda audios, reclamos y stickers mientras la masa espera.",
    choices: [
      {
        id: "ignorar_celulares",
        text: "Ignorar celulares",
        consequence: "La producción avanza, pero varios se sienten ignorados.",
        effects: { hallacas: 9, paciencia: -8, caos: 6 }
      },
      {
        id: "responder_todo",
        text: "Responder todo",
        consequence: "Baja el drama digital, pero la mesa se enfría.",
        effects: { paciencia: 8, caos: 10, hallacas: 3 }
      },
      {
        id: "mandar_foto_avance",
        text: "Mandar foto",
        consequence: "La foto calma al grupo, pero atrae más pedidos.",
        effects: { paciencia: 6, ingredientes: -8, hallacas: 5 }
      }
    ]
  },
  {
    id: "musica_muy_alta",
    title: "La música está demasiado alta",
    description: "La gaita suena duro. Nadie escucha instrucciones, pero todos cantan.",
    choices: [
      {
        id: "subir_mas",
        text: "Subir más",
        consequence: "El ánimo explota, pero la coordinación desaparece.",
        effects: { paciencia: 10, caos: 16, hallacas: 5 }
      },
      {
        id: "bajar_volumen",
        text: "Bajar volumen",
        consequence: "La cocina se organiza, aunque varios protestan.",
        effects: { caos: -10, paciencia: -6, hallacas: 8 }
      },
      {
        id: "poner_playlist_suave",
        text: "Playlist suave",
        consequence: "El ambiente mejora, pero alguien se pone sentimental.",
        effects: { paciencia: 8, caos: 6, hallacas: 5 }
      }
    ]
  },
  {
    id: "masa_aguada",
    title: "La masa quedó aguada",
    description: "La masa no agarra forma. Parece más sopa que hallaca.",
    choices: [
      {
        id: "agregar_harina",
        text: "Agregar harina",
        consequence: "La masa mejora, pero se gastan ingredientes importantes.",
        effects: { ingredientes: -14, hallacas: 8, caos: -4 }
      },
      {
        id: "trabajar_con_cuidado",
        text: "Trabajar con cuidado",
        consequence: "Avanzan lento y con miedo a que todo se desarme.",
        effects: { hallacas: 5, paciencia: -6, caos: 10 }
      },
      {
        id: "rehacer_masa",
        text: "Rehacer masa",
        consequence: "Queda mucho mejor, pero todos suspiran al mismo tiempo.",
        effects: { ingredientes: -18, paciencia: -10, hallacas: 7 }
      }
    ]
  },
  {
    id: "guiso_salado",
    title: "El guiso quedó salado",
    description: "Alguien prueba el guiso y se queda callado demasiado tiempo.",
    choices: [
      {
        id: "estirar_guiso",
        text: "Estirar el guiso",
        consequence: "El sabor mejora, pero se gastan más ingredientes.",
        effects: { ingredientes: -16, hallacas: 8, paciencia: -4 }
      },
      {
        id: "seguir_asi",
        text: "Seguir así",
        consequence: "La producción vuela, pero ya todos saben que algo pasó.",
        effects: { hallacas: 11, paciencia: -12, caos: 6 }
      },
      {
        id: "balancear_con_masa",
        text: "Balancear con masa",
        consequence: "Se disimula el problema, pero la técnica se complica.",
        effects: { hallacas: 7, caos: 8, ingredientes: -8 }
      }
    ]
  },
  {
    id: "falta_onoto",
    title: "Falta onoto",
    description: "La masa está pálida. Alguien dice que así no parece Navidad.",
    choices: [
      {
        id: "buscar_onoto",
        text: "Buscar onoto",
        consequence: "Aparece un frasquito salvador, pero la casa queda revuelta.",
        effects: { hallacas: 8, caos: 10, paciencia: -4 }
      },
      {
        id: "comprar_onoto",
        text: "Comprar onoto",
        consequence: "La masa queda bonita, pero se pierden tiempo y recursos.",
        effects: { ingredientes: -8, caos: 8, hallacas: 6 }
      },
      {
        id: "seguir_palidas",
        text: "Seguir pálidas",
        consequence: "Avanzan rápido, pero las críticas no perdonan.",
        effects: { hallacas: 10, paciencia: -12, caos: 4 }
      }
    ]
  },
  {
    id: "primo_con_antojo",
    title: "Llegó un primo con antojo",
    description: "Un primo aparece diciendo que solo venía a saludar. Nadie le cree.",
    choices: [
      {
        id: "darle_un_plato",
        text: "Darle un plato",
        consequence: "El primo se calma y ayuda, pero se va comida.",
        effects: { caos: -10, ingredientes: -12, hallacas: 7 }
      },
      {
        id: "ponerlo_a_amasar",
        text: "Ponerlo a amasar",
        consequence: "Trabaja bastante, aunque se queja cada cinco minutos.",
        effects: { hallacas: 10, paciencia: -8, caos: 6 }
      },
      {
        id: "decirle_que_espere",
        text: "Que espere",
        consequence: "No gastan comida, pero el primo aumenta la presión visual.",
        effects: { ingredientes: 4, caos: 18 }
      }
    ]
  },
  {
    id: "mesa_desastre",
    title: "La mesa es un desastre",
    description: "Hay hojas, masa, cucharas y opiniones encima de todo.",
    choices: [
      {
        id: "limpiar_mesa",
        text: "Limpiar mesa",
        consequence: "La cocina respira, pero todos sienten que retrocedieron.",
        effects: { caos: -8, hallacas: 3 }
      },
      {
        id: "seguir_en_el_desorden",
        text: "Seguir igual",
        consequence: "La producción avanza, pero nadie encuentra nada.",
        effects: { hallacas: 10, caos: 16, paciencia: -8 }
      },
      {
        id: "dividir_estaciones",
        text: "Dividir estaciones",
        consequence: "Cada quien tiene tarea, aunque reorganizar cuesta paciencia.",
        effects: { hallacas: 8, paciencia: -6, caos: -8 }
      }
    ]
  },
  {
    id: "silla_rota",
    title: "Se rompió una silla",
    description: "Una silla hace crack. Por suerte, el orgullo fue lo más golpeado.",
    choices: [
      {
        id: "repararla",
        text: "Repararla",
        consequence: "La silla vuelve a la vida, pero se pierden herramientas y tiempo.",
        effects: { ingredientes: -6, caos: 8, hallacas: 4 }
      },
      {
        id: "trabajar_de_pie",
        text: "Trabajar de pie",
        consequence: "Siguen produciendo, pero el cansancio se nota.",
        effects: { hallacas: 9, paciencia: -8, caos: 6 }
      },
      {
        id: "turnar_asientos",
        text: "Turnar asientos",
        consequence: "La paz física mejora, pero el ritmo se vuelve raro.",
        effects: { paciencia: 8, caos: 6, hallacas: 5 }
      }
    ]
  },
  {
    id: "olla_sospechosa",
    title: "La olla sospechosa",
    description: "El vecino presta una olla enorme que nadie está seguro de haber visto limpia.",
    choices: [
      {
        id: "lavarla_tres_veces",
        text: "Lavarla tres veces",
        consequence: "La olla queda confiable, pero la espera desespera.",
        effects: { caos: 4, hallacas: 5 }
      },
      {
        id: "usar_sin_preguntar",
        text: "Usarla ya",
        consequence: "La producción acelera, pero todos miran la olla con sospecha.",
        effects: { hallacas: 11, paciencia: -10, caos: 8 }
      },
      {
        id: "devolverla",
        text: "Devolverla",
        consequence: "Evitan el misterio, pero vuelven al problema de espacio.",
        effects: { caos: 4, hallacas: 3 }
      }
    ]
  },
  {
    id: "hallacas_veganas",
    title: "Alguien quiere hallacas veganas",
    description: "Un familiar propone una tanda vegana y la mesa se queda en silencio.",
    choices: [
      {
        id: "hacer_tanda_pequena",
        text: "Tanda pequeña",
        consequence: "La familia incluye a todos, pero la logística se complica.",
        effects: { paciencia: 8, ingredientes: -10, hallacas: 6 }
      },
      {
        id: "separar_estacion",
        text: "Separar estación",
        consequence: "Evitan mezclar ingredientes, aunque el caos sube.",
        effects: { hallacas: 7, caos: 12, paciencia: -4 }
      },
      {
        id: "posponer_idea",
        text: "Posponer idea",
        consequence: "La línea principal avanza, pero alguien queda dolido.",
        effects: { hallacas: 10, paciencia: -12, ingredientes: -4 }
      }
    ]
  },
  {
    id: "ninos_quieren_ayudar",
    title: "Los niños quieren ayudar",
    description: "Varias manitos aparecen listas para colaborar con energía peligrosa.",
    choices: [
      {
        id: "darles_masa",
        text: "Darles masa",
        consequence: "Se entretienen y levantan el ánimo, pero la masa sufre.",
        effects: { paciencia: 10, ingredientes: -8, hallacas: 5 }
      },
      {
        id: "ponerlos_a_contar",
        text: "Ponerlos a contar",
        consequence: "Cuentan hojas y pabilo, aunque alguien debe revisar todo.",
        effects: { hallacas: 6, caos: 2 }
      },
      {
        id: "sacarlos_de_cocina",
        text: "Sacarlos de cocina",
        consequence: "La cocina queda segura, pero empiezan las quejas desde la sala.",
        effects: { caos: -10, paciencia: -8, hallacas: 7 }
      }
    ]
  },
  {
    id: "abuela_revisa_tecnica",
    title: "La abuela revisa la técnica",
    description: "La abuela toma una hallaca, la mira, y todos contienen la respiración.",
    choices: [
      {
        id: "aceptar_correcciones",
        text: "Aceptar correcciones",
        consequence: "La calidad sube, pero el orgullo familiar baja.",
        effects: { hallacas: 7, paciencia: -10, caos: -8 }
      },
      {
        id: "pedir_clase_rapida",
        text: "Pedir clase rápida",
        consequence: "Aprenden a hacerlo mejor, aunque la ronda se vuelve lenta.",
        effects: { hallacas: 5, paciencia: 8, caos: 8 }
      },
      {
        id: "decir_que_si",
        text: "Decir que sí",
        consequence: "Todos sonríen y siguen igual, con riesgos evidentes.",
        effects: { hallacas: 10, caos: 10, paciencia: -6 }
      }
    ]
  },
  {
    id: "hojas_rotas",
    title: "Las hojas están rotas",
    description: "Muchas hojas vienen partidas y no quieren aguantar ni una cucharada.",
    choices: [
      {
        id: "doble_hoja",
        text: "Usar doble hoja",
        consequence: "Las hallacas quedan firmes, pero se gastan hojas rápido.",
        effects: { hallacas: 8, ingredientes: -14, caos: -4 }
      },
      {
        id: "recortar_pedazos",
        text: "Recortar pedazos",
        consequence: "Aprovechan más, pero el trabajo se vuelve minucioso.",
        effects: { hallacas: 6, paciencia: -8, caos: 8 }
      },
      {
        id: "hacer_tamano_mini",
        text: "Hacer mini hallacas",
        consequence: "Salen simpáticas y rápidas, pero todos opinan del tamaño.",
        effects: { hallacas: 10, paciencia: -10, ingredientes: -6 }
      }
    ]
  },
  {
    id: "hornilla_falla",
    title: "La hornilla no prende bien",
    description: "La llama aparece, desaparece y vuelve como si estuviera jugando.",
    choices: [
      {
        id: "insistir_con_cuidado",
        text: "Insistir con cuidado",
        consequence: "Logran cocinar, pero todos están pendientes de la llama.",
        effects: { hallacas: 7, caos: 8, paciencia: -6 }
      },
      {
        id: "usar_otra_hornilla",
        text: "Usar otra hornilla",
        consequence: "La cocina se reorganiza y se pierde algo de ritmo.",
        effects: { hallacas: 5, caos: 2 }
      },
      {
        id: "llamar_al_vecino",
        text: "Llamar al vecino",
        consequence: "Ayuda a prenderla, pero se queda dando consejos.",
        effects: { hallacas: 6, paciencia: -4, caos: 10 }
      }
    ]
  },
  {
    id: "botella_abierta",
    title: "Alguien abrió una botella",
    description: "Aparece una botella en la mesa y la concentración empieza a bailar.",
    choices: [
      {
        id: "brindis_controlado",
        text: "Brindis controlado",
        consequence: "El ánimo sube, pero la precisión baja un poquito.",
        effects: { paciencia: 12, caos: 8, hallacas: 5 }
      },
      {
        id: "guardar_botella",
        text: "Guardar botella",
        consequence: "La producción se mantiene seria, pero hay quejas.",
        effects: { hallacas: 8, paciencia: -8, caos: -6 }
      },
      {
        id: "celebrar_y_seguir",
        text: "Celebrar y seguir",
        consequence: "La mesa agarra energía, aunque nadie mide igual que antes.",
        effects: { hallacas: 10, caos: 14, ingredientes: -6 }
      }
    ]
  },
  {
    id: "hacer_mas_o_terminar",
    title: "¿Hacer más o terminar rápido?",
    description: "La familia mira la mesa: pueden ir por más o cerrar antes de colapsar.",
    choices: [
      {
        id: "hacer_mas",
        text: "Hacer más",
        consequence: "La meta se acerca bastante, pero la noche cobra factura.",
        effects: { hallacas: 14, caos: 12, paciencia: -10 }
      },
      {
        id: "terminar_rapido",
        text: "Terminar rápido",
        consequence: "Cierran una tanda decente, sacrificando calidad y cantidad.",
        effects: { hallacas: 8, caos: -8, ingredientes: -6 }
      },
      {
        id: "pausa_de_orden",
        text: "Pausa de orden",
        consequence: "Respiran y limpian, pero la producción avanza poco.",
        effects: { hallacas: 4, paciencia: 10, caos: 8 }
      }
    ]
  },
  {
    id: "nevera_llena",
    title: "La nevera está demasiado llena",
    description: "No cabe ni una hoja más. La nevera parece un rompecabezas navideño.",
    choices: [
      {
        id: "reorganizar_nevera",
        text: "Reorganizar nevera",
        consequence: "Consiguen espacio, pero aparece comida olvidada y opiniones.",
        effects: { caos: 8, paciencia: -6, hallacas: 6 }
      },
      {
        id: "sacar_refrescos",
        text: "Sacar refrescos",
        consequence: "Hay espacio, pero las bebidas calientes bajan el ánimo.",
        effects: { ingredientes: -6, paciencia: -8, hallacas: 8 }
      },
      {
        id: "usar_cava",
        text: "Usar cava",
        consequence: "La cava salva la noche, aunque hay que buscar hielo.",
        effects: { hallacas: 7, ingredientes: -8, caos: -4 }
      }
    ]
  },
  {
    id: "ingredientes_mezclados",
    title: "Se mezclaron los ingredientes",
    description: "Aceitunas, pasas y alcaparras aparecen juntas como si conspiraran.",
    choices: [
      {
        id: "separar_a_mano",
        text: "Separar a mano",
        consequence: "Recuperan el control, pero la paciencia se derrite.",
        effects: { hallacas: 5, paciencia: -14, caos: -6 }
      },
      {
        id: "mezcla_creativa",
        text: "Mezcla creativa",
        consequence: "Avanzan rápido con estilo sorpresa.",
        effects: { hallacas: 11, caos: 10, paciencia: -8 }
      },
      {
        id: "asignar_supervisor",
        text: "Asignar supervisor",
        consequence: "La mesa se ordena, aunque una persona deja de producir.",
        effects: { hallacas: 6, caos: -4 }
      }
    ]
  },
  {
    id: "ultima_tanda",
    title: "La última tanda",
    description: "Queda poco para terminar. Todos están cansados, pero ya huele a victoria.",
    choices: [
      {
        id: "remate_final",
        text: "Remate final",
        consequence: "Empujan con todo y casi terminan, pero la casa queda temblando.",
        effects: { hallacas: 16, caos: 18, paciencia: -12 }
      },
      {
        id: "cerrar_con_calma",
        text: "Cerrar con calma",
        consequence: "La tanda sale bonita, aunque la presión no perdona.",
        effects: { hallacas: 10, caos: 6 }
      },
      {
        id: "repartir_ultimas_tareas",
        text: "Repartir tareas",
        consequence: "Todos hacen algo, pero coordinar a la familia cuesta.",
        effects: { hallacas: 12, paciencia: -8, ingredientes: -8 }
      }
    ]
  },
  {
    id: "sobrino_quiere_probar",
    title: "El sobrino quiere probar todo",
    description: "Un sobrino aparece con cucharita en mano y demasiada confianza.",
    choices: [
      {
        id: "darle_pruebita",
        text: "Darle pruebita",
        consequence: "Se calma y celebra el sabor, pero la olla baja un poquito.",
        effects: { paciencia: 8, ingredientes: -8, hallacas: 5 }
      },
      {
        id: "alejar_cucharita",
        text: "Alejar cucharita",
        consequence: "Protegen el guiso, pero empieza una mini protesta.",
        effects: { ingredientes: 4, paciencia: -8, caos: 8, hallacas: 5 }
      },
      {
        id: "ponerlo_a_picar",
        text: "Ponerlo a picar",
        consequence: "Ayuda de verdad, aunque deja la tabla hecha un paisaje.",
        effects: { hallacas: 9, caos: 8, ingredientes: -4 }
      }
    ]
  },
  {
    id: "hojas_sin_espacio",
    title: "No hay dónde poner las hojas",
    description: "Las hojas lavadas ocupan sillas, mesa y media sala.",
    choices: [
      {
        id: "apilar_con_cuidado",
        text: "Apilar con cuidado",
        consequence: "Ganan espacio, pero varias hojas quedan marcadas.",
        effects: { caos: -10, ingredientes: -6, hallacas: 6 }
      },
      {
        id: "usar_la_sala",
        text: "Usar la sala",
        consequence: "La cocina respira y la sala queda en modo hallaca.",
        effects: { hallacas: 8, caos: 10, paciencia: -4 }
      },
      {
        id: "armar_cadena",
        text: "Armar cadena",
        consequence: "Las hojas fluyen rápido, pero todos se atraviesan.",
        effects: { hallacas: 10, caos: 14 }
      }
    ]
  },
  {
    id: "se_acabo_el_gas",
    title: "Se acabó el gas",
    description: "La llama muere justo cuando la olla estaba agarrando ritmo.",
    choices: [
      {
        id: "buscar_bombona",
        text: "Buscar bombona",
        consequence: "Resuelven la cocción, pero se va energía y tiempo.",
        effects: { hallacas: 7, caos: 12, paciencia: -8 }
      },
      {
        id: "cocinar_en_casa_vecina",
        text: "Casa vecina",
        consequence: "La vecina presta cocina, pero la operación se vuelve mudanza.",
        effects: { hallacas: 9, caos: 16, ingredientes: -6 }
      },
      {
        id: "pausar_y_ordenar",
        text: "Pausar y ordenar",
        consequence: "La familia controla el desastre mientras consigue solución.",
        effects: { caos: -14, paciencia: 6, hallacas: 3 }
      }
    ]
  },
  {
    id: "sobro_masa_falto_guiso",
    title: "Sobró masa, faltó guiso",
    description: "La proporción falló. Hay masa mirando al vacío y poco relleno.",
    choices: [
      {
        id: "hallacas_mas_finas",
        text: "Hallacas finas",
        consequence: "Rinden el guiso, pero todos comentan el grosor.",
        effects: { hallacas: 9, paciencia: -10, ingredientes: -4 }
      },
      {
        id: "hacer_mas_guiso",
        text: "Más guiso",
        consequence: "La tanda mejora, pero los ingredientes sufren.",
        effects: { ingredientes: -18, hallacas: 8, caos: 6 }
      },
      {
        id: "guardar_masa",
        text: "Guardar masa",
        consequence: "Evitan desperdicio, pero avanzan menos de lo esperado.",
        effects: { ingredientes: 6, hallacas: 4, caos: 6 }
      }
    ]
  },
  {
    id: "visita_con_consejos",
    title: "Visita con demasiados consejos",
    description: "Alguien que no está ayudando opina sobre cada hoja y cada amarre.",
    choices: [
      {
        id: "darle_tarea_real",
        text: "Darle tarea real",
        consequence: "Habla menos y produce algo, aunque no sin drama.",
        effects: { hallacas: 8, paciencia: -6, caos: 6 }
      },
      {
        id: "agradecer_e_ignorar",
        text: "Agradecer e ignorar",
        consequence: "La mesa sigue, pero la tensión queda flotando.",
        effects: { hallacas: 9, paciencia: -10, caos: 4 }
      },
      {
        id: "pedirle_musica",
        text: "Pedirle música",
        consequence: "Se distrae poniendo canciones, para bien y para mal.",
        effects: { paciencia: 8, caos: 8, hallacas: 5 }
      }
    ]
  },
  {
    id: "primera_hallaca_se_rompe",
    title: "La primera hallaca se rompió",
    description: "La primera prueba se abre como si quisiera escapar.",
    choices: [
      {
        id: "aprender_del_error",
        text: "Aprender del error",
        consequence: "Mejoran la técnica, pero el inicio golpea la moral.",
        effects: { hallacas: 6, paciencia: -8, caos: -6 }
      },
      {
        id: "culpar_la_hoja",
        text: "Culpar la hoja",
        consequence: "Todos se ríen un poco, pero el problema sigue ahí.",
        effects: { paciencia: 6, ingredientes: -6, hallacas: 5 }
      },
      {
        id: "reforzar_amarres",
        text: "Reforzar amarres",
        consequence: "Salen más firmes, pero usan más pabilo y tiempo.",
        effects: { hallacas: 8, ingredientes: -10, caos: 6 }
      }
    ]
  },
  {
    id: "todos_estan_desesperados",
    title: "Todos están desesperados",
    description: "Ya nadie habla de hallacas. Hablan de comer cualquier cosa.",
    choices: [
      {
        id: "merienda_rapida",
        text: "Merienda rápida",
        consequence: "La tensión baja, pero se van ingredientes de emergencia.",
        effects: { caos: -18, ingredientes: -12, hallacas: 4 }
      },
      {
        id: "prometer_primeras",
        text: "Prometer las primeras",
        consequence: "La promesa motiva a todos, pero la presión sube.",
        effects: { hallacas: 10, caos: 8, paciencia: -6 }
      },
      {
        id: "apurar_tanda",
        text: "Apurar tanda",
        consequence: "Avanzan con velocidad, sacrificando calma.",
        effects: { hallacas: 12, paciencia: -12, caos: 10 }
      }
    ]
  }
];

const billActions = {
  calmar_policia: {
    label: "calmar a la policía",
    effects: { caos: -40 },
    message: (name) => `${name} usó el billete de $100 para calmar a la policía. Caos -40.`
  },
  pedir_pizza: {
    label: "pedir pizza para distraer a todos",
    effects: { caos: -30, paciencia: 8 },
    message: (name) => `${name} usó el billete de $100 para pedir pizza y distraer a todos. Caos -30, Paciencia +8.`
  },
  comprar_ingredientes: {
    label: "comprar más ingredientes",
    effects: { ingredientes: 25 },
    message: (name) => `${name} usó el billete de $100 para comprar más ingredientes. Ingredientes +25.`
  }
};

const surpriseEvents = [
  { title: "Se fue la luz", text: "La cocina queda a oscuras y alguien prende la linterna del celular como si fuera quirófano.", effects: { caos: 12, paciencia: -6 } },
  { title: "La abuela puso orden", text: "La abuela entró seria, miró a todo el mundo y de repente la casa funcionó mejor.", effects: { caos: -10, paciencia: 8 } },
  { title: "Llegó otro primo con antojo", text: "Apareció un primo que nadie invitó, preguntando si ya estaban listas.", effects: { caos: 10, ingredientes: -5 } },
  { title: "Encontraron más hojas", text: "Alguien consiguió un paquete de hojas escondido detrás de unas bolsas.", effects: { ingredientes: 10, paciencia: 3 } },
  { title: "El perro hizo una de las suyas", text: "El perro apareció con cara de inocente y masa en el hocico.", effects: { ingredientes: -8, caos: 10 } },
  { title: "Pusieron gaitas", text: "Suena una gaita clásica y por dos minutos todo el mundo recuerda que esto también es bonito.", effects: { paciencia: 8, caos: -4 } },
  { title: "El grupo de WhatsApp explotó", text: "Tres personas que no están ayudando empiezan a opinar por el grupo familiar.", effects: { paciencia: -8, caos: 6 } },
  { title: "Apareció una olla extra", text: "Nadie sabe de quién es, pero sirve. La producción respira.", effects: { hallacas: 6, caos: -4 } },
  { title: "Se rompió una silla", text: "Alguien se sentó con demasiada confianza. La silla no sobrevivió.", effects: { caos: 8, paciencia: -5 } },
  { title: "La tía trajo refuerzos", text: "Llegó una tía con energía de mando y manos rápidas.", effects: { hallacas: 8, paciencia: -3 } },
  { title: "Se salvó el guiso", text: "Parecía perdido, pero alguien lo movió justo a tiempo.", effects: { ingredientes: 6, caos: -5 } },
  { title: "Discusión por las pasas", text: "Alguien preguntó si las hallacas llevan pasas. La paz duró exactamente cuatro segundos.", effects: { paciencia: -10, caos: 8 } }
];

const rooms = new Map();

io.on("connection", (socket) => {
  socket.data.roomCode = null;
  socket.data.playerName = null;

  socket.on("createRoom", ({ name }, reply) => {
    const playerName = cleanName(name);
    if (!playerName) return replyError(reply, "Escribe tu nombre.");

    const code = generateRoomCode();
    const room = {
      code,
      hostId: socket.id,
      players: [{ id: socket.id, name: playerName }],
      difficulty: "facil",
      game: createInitialGameState("facil")
    };

    rooms.set(code, room);
    joinSocketRoom(socket, code, playerName);
    replyOk(reply, { code, playerId: socket.id });
    broadcastRoom(code);
  });

  socket.on("joinRoom", ({ name, code }, reply) => {
    const playerName = cleanName(name);
    const roomCode = cleanCode(code);

    if (!playerName) return replyError(reply, "Escribe tu nombre.");
    if (!/^\d{4}$/.test(roomCode)) return replyError(reply, "Escribe un código de sala válido de 4 números.");

    const room = rooms.get(roomCode);
    if (!room) return replyError(reply, "Sala no encontrada.");

    const duplicate = room.players.some((player) => player.name.toLowerCase() === playerName.toLowerCase());
    if (duplicate) return replyError(reply, "Ese nombre ya está en esta sala.");

    room.players.push({ id: socket.id, name: playerName });
    joinSocketRoom(socket, roomCode, playerName);
    replyOk(reply, { code: roomCode, playerId: socket.id });
    broadcastRoom(roomCode);
  });

  socket.on("changeDifficulty", ({ difficulty }, reply) => {
    const room = getSocketRoom(socket);
    if (!room) return replyError(reply, "Sala no encontrada.");
    if (room.hostId !== socket.id) return replyError(reply, "Solo el anfitriÃ³n puede cambiar la dificultad.");
    if (room.game.status !== "lobby") return replyError(reply, "La dificultad queda bloqueada cuando empieza la hallacada.");
    if (!DIFFICULTY_SETTINGS[difficulty]) return replyError(reply, "Esa dificultad no existe.");

    room.difficulty = difficulty;
    room.game = createInitialGameState(difficulty);
    replyOk(reply);
    broadcastRoom(room.code);
  });

  socket.on("startGame", (reply) => {
    const room = getSocketRoom(socket);
    if (!room) return replyError(reply, "Sala no encontrada.");
    if (room.hostId !== socket.id) return replyError(reply, "Solo el anfitrión puede empezar las hallacas.");
    if (room.game.status !== "lobby") return replyError(reply, "La hallacada ya empezó.");

    room.game = createInitialGameState(room.difficulty);
    room.game.status = "voting";
    addLog(room.game, "La hallacada empezó.");
    room.game.currentScenario = selectScenario(room.game);
    addLog(room.game, "Nueva situación en la cocina.");
    replyOk(reply);
    broadcastRoom(room.code);
  });

  socket.on("vote", ({ choiceId }, reply) => {
    const room = getSocketRoom(socket);
    if (!room) return replyError(reply, "Sala no encontrada.");
    if (room.game.status !== "voting") return replyError(reply, "Ahora mismo no se está votando.");
    if (room.game.votes[socket.id]) return replyError(reply, "Ya votaste en esta ronda.");

    const scenario = room.game.currentScenario;
    const choice = scenario.choices.find((item) => item.id === choiceId);
    if (!choice) return replyError(reply, "Esa opción no está disponible.");

    room.game.votes[socket.id] = choiceId;
    addLog(room.game, `${socket.data.playerName} votó.`);
    replyOk(reply);

    if (allPlayersVoted(room)) {
      resolveVote(room);
    }

    broadcastRoom(room.code);
  });

  socket.on("nextRound", (reply) => {
    const room = getSocketRoom(socket);
    if (!room) return replyError(reply, "Sala no encontrada.");
    if (room.hostId !== socket.id) return replyError(reply, "Solo el anfitrión puede pasar a la siguiente ronda.");
    if (room.game.status !== "result") return replyError(reply, "La familia todavía no está lista para la siguiente ronda.");

    room.game.round += 1;
    room.game.votes = {};
    room.game.result = null;
    room.game.billUseResult = null;
    room.game.status = "voting";
    room.game.currentScenario = selectScenario(room.game);
    addLog(room.game, "Nueva situación en la cocina.");
    replyOk(reply);
    broadcastRoom(room.code);
  });

  socket.on("useBill", ({ actionId }, reply) => {
    const room = getSocketRoom(socket);
    if (!room) return replyError(reply, "Sala no encontrada.");
    if (!room.game.hasBill || room.game.billUsed) return replyError(reply, "El billete de $100 ya no está disponible.");

    const action = billActions[actionId];
    if (!action) return replyError(reply, "Esa opción del billete no existe.");

    room.game.hasBill = false;
    room.game.billUsed = true;
    applyEffects(room.game.stats, action.effects);
    clampStats(room.game.stats);

    const message = action.message(socket.data.playerName);
    room.game.billUseResult = {
      playerName: socket.data.playerName,
      actionId,
      label: action.label,
      effects: action.effects,
      message
    };
    addLog(room.game, message);
    addLog(room.game, "El billete de $100 fue usado.");

    const endedReason = getEndedReason(room.game.stats);
    if (endedReason) {
      room.game.status = "ended";
      room.game.endedReason = endedReason;
    }

    replyOk(reply);
    broadcastRoom(room.code);
  });

  socket.on("backToLobby", (reply) => {
    const room = getSocketRoom(socket);
    if (!room) return replyError(reply, "Sala no encontrada.");
    if (room.hostId !== socket.id) return replyError(reply, "Solo el anfitrión puede volver a la cocina.");

    room.game = createInitialGameState(room.difficulty);
    replyOk(reply);
    broadcastRoom(room.code);
  });

  socket.on("restartGame", (reply) => {
    const room = getSocketRoom(socket);
    if (!room) return replyError(reply, "Sala no encontrada.");
    if (room.hostId !== socket.id) return replyError(reply, "Solo el anfitrión puede volver a empezar.");

    room.game = createInitialGameState(room.difficulty);
    room.game.status = "voting";
    addLog(room.game, "La hallacada empezó.");
    room.game.currentScenario = selectScenario(room.game);
    addLog(room.game, "Nueva situación en la cocina.");
    replyOk(reply);
    broadcastRoom(room.code);
  });

  socket.on("disconnect", () => {
    const code = socket.data.roomCode;
    if (!code || !rooms.has(code)) return;

    const room = rooms.get(code);
    room.players = room.players.filter((player) => player.id !== socket.id);
    delete room.game.votes[socket.id];

    if (room.players.length === 0) {
      rooms.delete(code);
      return;
    }

    if (room.hostId === socket.id) {
      room.hostId = room.players[0].id;
    }

    if (room.game.status === "voting" && allPlayersVoted(room)) {
      resolveVote(room);
    }

    broadcastRoom(code);
  });
});

function createInitialGameState(difficulty = "facil") {
  const settings = getDifficultySettings(difficulty);
  return {
    status: "lobby",
    round: 1,
    difficulty,
    stats: { ...settings.startingStats },
    currentScenario: null,
    usedScenarioIds: [],
    votes: {},
    result: null,
    endedReason: null,
    specialBillRound: 7,
    billScenarioShown: false,
    hasBill: false,
    billUsed: false,
    billUseResult: null,
    log: []
  };
}

function selectScenario(game) {
  if (game.round === game.specialBillRound && !game.billScenarioShown) {
    game.billScenarioShown = true;
    return specialBillScenario;
  }

  const unused = scenarios.filter((scenario) => !game.usedScenarioIds.includes(scenario.id));
  const pool = unused.length > 0 ? unused : scenarios;
  const scenario = pool[Math.floor(Math.random() * pool.length)];

  if (unused.length === 0) {
    game.usedScenarioIds = [];
  }

  game.usedScenarioIds.push(scenario.id);
  return scenario;
}

function resolveVote(room) {
  const scenario = room.game.currentScenario;
  const counts = {};

  Object.values(room.game.votes).forEach((choiceId) => {
    counts[choiceId] = (counts[choiceId] || 0) + 1;
  });

  const highCount = Math.max(...Object.values(counts));
  const tiedChoiceIds = Object.keys(counts).filter((choiceId) => counts[choiceId] === highCount);
  const winningChoiceId = tiedChoiceIds[Math.floor(Math.random() * tiedChoiceIds.length)];
  const winningChoice = scenario.choices.find((choice) => choice.id === winningChoiceId);
  const choiceEffects = { ...winningChoice.effects };
  let consequence = winningChoice.consequence;
  let billWon = false;

  applyEffects(room.game.stats, choiceEffects);

  if (scenario.isSpecialBill && winningChoice.billChance > 0) {
    billWon = Math.random() < winningChoice.billChance;
    if (billWon) {
      room.game.hasBill = true;
      consequence = winningChoice.winConsequence;
      addLog(room.game, "La familia consiguió el billete de $100.");
    }
  }

  const pressure = getDifficultySettings(room.game.difficulty).pressure;
  if (pressure) {
    applyEffects(room.game.stats, pressure);
  }

  const surprise = maybeApplySurpriseEvent(room.game);
  clampStats(room.game.stats);

  room.game.result = {
    winningChoiceId,
    winningText: winningChoice.text,
    consequence,
    effects: choiceEffects,
    surprise,
    voteCounts: counts,
    tieBroken: tiedChoiceIds.length > 1,
    billWon,
    isSpecialBill: !!scenario.isSpecialBill
  };

  if (pressure) {
    room.game.result.pressure = { ...pressure };
  }

  addLog(room.game, `La familia decidió: ${winningChoice.text}.`);
  if (surprise) {
    addLog(room.game, `Evento sorpresa: ${surprise.title}.`);
  }

  const endedReason = getEndedReason(room.game.stats);
  if (endedReason) {
    room.game.status = "ended";
    room.game.endedReason = endedReason;
  } else {
    room.game.status = "result";
  }
}

function applyEffects(stats, effects) {
  Object.entries(effects).forEach(([stat, change]) => {
    stats[stat] += change;
  });
}

function clampStats(stats) {
  Object.keys(stats).forEach((stat) => {
    stats[stat] = Math.max(0, Math.min(100, stats[stat]));
  });
}

function maybeApplySurpriseEvent(game) {
  if (game.round < 2 || Math.random() >= 0.25) {
    return null;
  }

  const event = surpriseEvents[Math.floor(Math.random() * surpriseEvents.length)];
  applyEffects(game.stats, event.effects);
  return {
    title: event.title,
    text: event.text,
    effects: { ...event.effects }
  };
}

function getEndedReason(stats) {
  if (stats.hallacas >= WIN_HALLACAS) return "success";
  if (stats.ingredientes <= 0) return "ingredientes";
  if (stats.paciencia <= 0) return "paciencia";
  if (stats.caos >= 100) return "caos";
  return null;
}

function getDifficultySettings(difficulty) {
  return DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.facil;
}

function allPlayersVoted(room) {
  return room.players.length > 0 && room.players.every((player) => room.game.votes[player.id]);
}

function broadcastRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  io.to(code).emit("roomState", sanitizeRoom(room));
}

function sanitizeRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    difficulty: room.difficulty,
    difficultyLabel: getDifficultySettings(room.difficulty).label,
    players: room.players,
    game: {
      status: room.game.status,
      round: room.game.round,
      difficulty: room.game.difficulty,
      stats: room.game.stats,
      currentScenario: room.game.currentScenario,
      votedPlayerIds: Object.keys(room.game.votes),
      result: room.game.result,
      endedReason: room.game.endedReason,
      hasBill: room.game.hasBill,
      billUsed: room.game.billUsed,
      billUseResult: room.game.billUseResult,
      log: room.game.log
    }
  };
}

function addLog(game, message) {
  game.log.push(message);
  game.log = game.log.slice(-8);
}

function generateRoomCode() {
  let code = "";
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (rooms.has(code));
  return code;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cleanName(name) {
  return String(name || "").trim().slice(0, 18);
}

function cleanCode(code) {
  return String(code || "").trim();
}

function joinSocketRoom(socket, code, playerName) {
  if (socket.data.roomCode) {
    socket.leave(socket.data.roomCode);
  }

  socket.join(code);
  socket.data.roomCode = code;
  socket.data.playerName = playerName;
}

function getSocketRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return null;
  return rooms.get(code) || null;
}

function replyOk(reply, data = {}) {
  if (typeof reply === "function") {
    reply({ ok: true, ...data });
  }
}

function replyError(reply, message) {
  if (typeof reply === "function") {
    reply({ ok: false, message });
  }
}

server.listen(PORT, () => {
  console.log(`Hallacas en Familia corre en http://localhost:${PORT}`);
});
