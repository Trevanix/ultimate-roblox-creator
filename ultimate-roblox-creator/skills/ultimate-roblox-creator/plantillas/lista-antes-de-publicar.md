# Lista antes de publicar: <juego> (<fecha>)

Repásala con la persona (skill `rc-publicar`). Marca cada punto; lo que no aplique, «no aplica».

## Claude comprueba
- [ ] Batería entera en verde (<n/n>) y revisión independiente de seguridad hecha.
- [ ] Todos los remotos validan tipo, NaN, límites, frecuencia y distancia.
- [ ] Almacén de prueba que solo actúa en Studio (`IsStudio()`); objetos y modos de prueba quitados del lugar; trucos imposibles fuera de Studio.
- [ ] Guardado: bloqueo de sesión, reintentos, versión de esquema, `BindToClose`; perfil que no carga = no se guarda.
- [ ] Un solo `ProcessReceipt`, idempotente, con guardado confirmado; recibos en curso marcados.
- [ ] Precios en pantalla = precios de Roblox; nombres e iconos de productos claros.
- [ ] Sin prisas de compra; pago al azar con probabilidad visible y `PolicyService` consultado (o no hay).
- [ ] Interfaz probada en el Device Simulator (teléfono pequeño, tableta, consola) y con mando emulado.
- [ ] Textos según la edad y el léxico del juego; página «Antes de comprar» si hay ventas.
- [ ] Consola sin errores de nuestros scripts en Play; sin scripts extraños en Workspace.
- [ ] Comprobación de `rc-publicar` = `OK lista de Claude`; si hay sonido, la de `rc-sonido` = `OK registro`.
- [ ] Cada sonido con fuente, autor, licencia y enlace; atribuciones CC BY copiadas a la descripción.
- [ ] Rendimiento medido (piezas, streaming, bucles); sin bucles sin tope.
- [ ] `CLAUDE.md` e informes al día.

## La persona hace (Claude le dice qué pulsar)
- [ ] Respaldo del lugar con nombre y fecha.
- [ ] «Enable Studio Access to API Services» apagado en el juego en vivo (Roblox pide no activarlo ahí).
- [ ] Cuestionario de clasificación de contenido (Content ratings) rellenado (Claude prepara borrador).
- [ ] Dispositivos elegidos.
- [ ] Lo que pide su cuenta para el público elegido, comprobado por ella (`rc-publicar`, Paso C).
- [ ] Página del juego: nombre, descripción, icono 512×512, miniaturas 16:9 (todo original).
- [ ] Audios subidos y con acceso dado a este juego (si el juego es de un grupo, también).
- [ ] Productos y Game Pass creados, con precio y a la venta.
- [ ] Publicar en privado (Playtest) y probar con amigos (distintos dispositivos, varios a la vez, una compra barata).
- [ ] Si cambió el esquema: reiniciar servidores (nombre del botón: ver `rc-publicar`).
- [ ] Cada lugar aparte publicado por separado.
- [ ] Publicar en público (Manage Audience → Public) cuando esté contenta.

## Después de publicar
- [ ] Errores del juego publicado mirados (Creator Dashboard) y versión apuntada en `CLAUDE.md`.

## Sin comprobar (decirlo claro)
- <teléfono real / consola real / muchos jugadores / compras reales / viajes entre lugares>
