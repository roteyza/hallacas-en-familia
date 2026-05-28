# Hallacas en Familia

**Versión actual:** Hallacas en Familia v0.5 — Score final

**Hallacas en Familia** es un juego cooperativo móvil para jugar con amigos o familia desde el navegador. La familia intenta terminar las hallacas de Navidad mientras todo se complica: caos, discusiones, visitas, fallas de cocina y decisiones peligrosas.

Subtítulo: **Un juego cooperativo de decisiones, caos y supervivencia familiar.**

## Cómo instalar

```bash
npm install
```

## Cómo correr localmente

```bash
npm start
```

Luego abre:

```text
http://localhost:3000
```

URL desplegada actual:

```text
https://hallacas-en-familia.onrender.com
```

Para desarrollo:

```bash
npm run dev
```

## Cómo desplegar en Render

1. Sube el proyecto a GitHub.
2. Entra a Render y crea un **New Web Service**.
3. Conecta el repositorio de GitHub.
4. Selecciona ambiente **Node**.
5. Usa este build command:

```bash
npm install
```

6. Usa este start command:

```bash
npm start
```

7. Espera a que Render termine el deploy.
8. Abre la URL pública de Render desde cualquier celular.

El frontend y el backend corren en el mismo servicio Node. Socket.IO usa el mismo dominio y el mismo puerto del servidor.

## Cómo probar que Socket.IO funciona en producción

1. Abre la URL desplegada en dos celulares o en dos pestañas del navegador.
2. Crea una sala en un dispositivo.
3. Únete desde el otro dispositivo usando el código de sala.
4. Empieza la partida desde el anfitrión.
5. Vota desde ambos dispositivos.
6. Verifica que los votos, el resultado, las stats y la siguiente ronda se actualicen en tiempo real en ambos lados.

## Cómo probar con varias pestañas

1. Abre `http://localhost:3000` en una pestaña.
2. Escribe tu nombre y crea una sala.
3. Copia el código de 4 números.
4. Abre otra pestaña o navegador.
5. Escribe otro nombre, coloca el código y únete a la sala.
6. El anfitrión presiona **Empezar hallacas**.
7. Cada jugador vota una vez.
8. El resultado aparece cuando todos los jugadores conectados votan.

## Cómo probar desde celulares en la misma red WiFi

1. Corre el servidor en tu computadora con `npm start`.
2. Busca la IP local de tu computadora.
   - Windows: usa `ipconfig` y revisa la dirección IPv4 del adaptador WiFi.
   - macOS/Linux: usa `ifconfig` o `ip addr`.
3. En cada celular conectado al mismo WiFi, abre:

```text
http://TU_IP_LOCAL:3000
```

Ejemplo:

```text
http://192.168.1.25:3000
```

## Reglas del juego

La familia ve una situación por ronda y vota entre tres decisiones. Cada jugador puede votar una sola vez. La opción con más votos gana. Si hay empate, el servidor elige al azar entre las opciones empatadas.

El servidor aplica los efectos de la decisión, puede aplicar un evento sorpresa desde la ronda 2, ajusta los stats entre 0 y 100, revisa victoria o derrota y manda el estado actualizado a todos.

No hay límite de rondas. La hallacada termina solo cuando se gana o se pierde.

## Dificultad

La sala empieza en **Fácil**. Solo el anfitrión puede cambiar la dificultad antes de empezar la hallacada, y todos pueden ver la dificultad elegida en el lobby. Cuando la partida empieza, la dificultad queda bloqueada.

**Fácil — familiar y más relajado**

- Ingredientes: 75
- Paciencia: 75
- Caos: 15
- Hallacas: 0
- Sin presión automática por ronda.
- Eventos sorpresa: 25% desde la ronda 2.
- La Apuesta del Tío aparece en ronda 7.

**Difícil — más caos, menos margen**

- Ingredientes: 70
- Paciencia: 70
- Caos: 20
- Hallacas: 0
- Presión automática por ronda: Caos +3, Paciencia -1.
- Eventos sorpresa: 25% desde la ronda 2.
- La Apuesta del Tío aparece en ronda 7.

## Stats

- **Ingredientes 🥩**: comida, hojas, masa, guiso, pabilo y materiales. En Fácil empieza en 75; en Difícil empieza en 70.
- **Paciencia 😤**: estabilidad emocional de la familia. En Fácil empieza en 75; en Difícil empieza en 70.
- **Caos 🔥**: desorden, estrés, antojos acumulados, interrupciones y locura general. En Fácil empieza en 15; en Difícil empieza en 20.
- **Hallacas 🫔**: progreso para terminar la producción. Empieza en 0.

Todos los stats se mantienen entre 0 y 100.

## Condiciones de victoria y derrota

La familia gana si:

- **Hallacas 🫔** llega a 100 o más.

La familia pierde si:

- **Ingredientes 🥩** llega a 0.
- **Paciencia 😤** llega a 0.
- **Caos 🔥** llega a 100.

## Cómo funcionan las rondas

1. El anfitrión empieza la hallacada desde la cocina.
2. El servidor elige una situación.
3. Todos ven la misma situación, los mismos stats y tres opciones.
4. Cada jugador vota una vez.
5. Se ve quién votó, pero no qué eligió.
6. Cuando todos votan, gana la mayoría.
7. El resultado muestra la decisión familiar, la consecuencia, los cambios por la decisión, cualquier evento sorpresa y el estado actual.
8. Si la partida no terminó, el anfitrión pasa a la siguiente ronda.


## Caos y ritmo de partida

El caos ahora viene de las decisiones de la familia y de los eventos sorpresa, no de una presión automática por ronda. Esto hace que cada partida dependa más de las decisiones y menos de una subida fija.

## Eventos sorpresa

Desde la ronda 2, hay 25% de probabilidad de que ocurra un evento sorpresa. Estos eventos son cortos, absurdos y familiares: pueden subir o bajar Caos, Paciencia, Ingredientes o Hallacas. Si ocurre uno, aparece separado en la pantalla de resultado y también entra en el log.

## Colores de cambios de stats

En la pantalla de resultado, los cambios usan colores por impacto para el equipo:

- **Verde**: ayuda al equipo.
- **Rojo**: perjudica al equipo.
- **Gris**: neutral.

Para Ingredientes, Paciencia y Hallacas, subir es bueno y bajar es malo. Para Caos es al revés: bajar Caos es bueno y subir Caos es malo.

## Billete de $100

Una vez por partida puede aparecer una situación especial: **La Apuesta del Tío**.

El servidor muestra esta situación exactamente en la ronda 7, si la partida llega hasta allí. Aparece en lugar de una situación normal.

La familia puede intentar conseguir un billete de $100:

- **Organizar pelea de gallos**: Caos +10 y tiene 70% de probabilidad de conseguir el billete.
- **Vender las aceitunas**: Ingredientes -10, Paciencia -5 y tiene 40% de probabilidad de conseguir el billete.
- **Seguir trabajando**: Caos -10, Hallacas +10 y no da billete.

Si la familia consigue el billete, aparece para todos como una opción especial. Cualquier jugador puede usarlo una sola vez, sin votación.

Opciones del billete:

- **Calmar a la policía**: Caos -40.
- **Pedir pizza para distraer a todos**: Caos -30, Paciencia +8.
- **Comprar más ingredientes**: Ingredientes +25.

Para evitar accidentes, hay que tocar la opción dos veces. El primer uso válido cuenta, el servidor lo aplica, el billete desaparece y se revisa si la partida terminó.

El estado del billete también cuenta para el score final:

- **No ganado**: nunca apareció o no se ganó en La Apuesta del Tío.
- **Ganado pero no usado**: la familia lo ganó, pero terminó la partida sin gastarlo.
- **Usado**: alguien lo activó durante la partida.

## Score final

Cuando la hallacada termina, el servidor calcula un score final para que las familias puedan competir por la mejor partida.

Puntos base:

- Hallacas: `Hallacas x 10`.
- Ingredientes restantes: `Ingredientes x 3`.
- Paciencia restante: `Paciencia x 3`.
- Control de caos: `(100 - Caos) x 3`.

Bonos:

- +500 si la familia gana.
- +200 si gana en Difícil.
- +150 si gana sin usar el billete de $100.
- +100 si el Caos final queda por debajo de 50.
- +100 si la Paciencia final queda por encima de 50.

Penalizaciones:

- -50 por cada ronda jugada.
- -150 si la familia pierde.

El score nunca baja de 0.

Categorías:

- 0-499: **Hallacada en emergencia**
- 500-999: **Hallacada accidentada**
- 1000-1499: **Hallacada decente**
- 1500-1999: **Hallacada sabrosa**
- 2000 o más: **Hallacada legendaria**

## Estructura del proyecto

```text
server.js           Servidor Express + Socket.IO, salas, estado, escenarios y reglas
package.json        Scripts y dependencias
public/index.html   Interfaz móvil
public/styles.css   Estilo visual
public/client.js    Cliente Socket.IO y renderizado
README.md           Guía del proyecto
```

## Notas técnicas

- Sin base de datos.
- Sin autenticación.
- Sin roles de jugador.
- Todo el estado vive en memoria del servidor.
- El servidor es autoritativo.
- Los clientes solo envían acciones como crear sala, unirse, empezar, votar, siguiente ronda y usar el billete.
