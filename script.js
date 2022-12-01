// /////////////////////////////////INICIALIZACION/////////////////////////////////
// Captura de elementos HTML

let catalogoSimple = document.getElementById("catalogoSimple")  //Catalogo de productos individuales
let catalogoPack = document.getElementById("catalogoPaquete")   //Catalogos de productos por paquete
let carroDisplay = document.getElementById("carro")             //Display del carro
let mostrarCarro = document.getElementById("mostrarCarro")      //Ocultacion y revelacion de carro
let comprar = document.getElementById("comprar")                //Confirmacion de compra de produtos
let limpiar = document.getElementById("limpiar")                //Limpiar carro de compras

// Variables auxiliares

let itemCarro   //Producto en el carro
let infoProd    //Informacion de producto
let btnDel      //Botones de eliminacion
let total       //Total de suma

// Recuperacion del carro de compras y creacion de tarjetas respectivas
let carro = JSON.parse(localStorage.getItem('carro')) || []
for (const producto of carro) {

    itemCarro = document.createElement('div')

    itemCarro.className = 'itemCarro'
                itemCarro.id = `carro${producto.id}`
                itemCarro.innerHTML =   `<img src="${producto.img}" width="70px" height="70px">
                                        <p>${producto.nombre.charAt(0).toUpperCase() + producto.nombre.slice(1)}</p>
                                        <p>Precio:<br>$${producto.precio}</p>
                                        <p id="cantidad${producto.id}">Cantidad:<br>${producto.cantidad}</p>
                                        <button onclick="carritoDel(${producto.id})"><img src="./assets/basura.png"></button>
                                        `
                
    carroDisplay.append(itemCarro)

    sumaTotal()
}

// /////////////////////////////////FUNCIONES/////////////////////////////////

//Eliminar item del carrito
let carritoDel = (prodId) => {

    carro.splice(carro.indexOf(carro.find((producto) => producto.id == prodId)), 1)
    document.getElementById(`carro${prodId}`).remove()
    localStorage.setItem('carro', JSON.stringify(carro))

    // Notificacion al usuario
    Toastify({
        
        style: {
            background: "linear-gradient(to right, rgb(142, 255, 148), rgb(117, 247, 41))",
            color: "black"
        },
        text: "Articulo eliminado",
        duration: 1500
    }).showToast()
}

function sumaTotal () {

    total = 0
    for (const producto of carro) {

        total = total + producto.precio * producto.cantidad
    }

    document.getElementById('total').innerHTML = `Total: ${total}`
}

// /////////////////////////////////CODIGO/////////////////////////////////

// Captura del catalogo en JSON a traves de fetch
fetch('./stock.json')
    .then((resp) => resp.json())
    .then((stock) => {

        //Creacion de tarjetas
        stock.forEach(producto => {

            const tarjeta = document.createElement("tarjeta")

            tarjeta.className = 'tarjetaCatalogo'
            tarjeta.innerHTML =`<h4>${producto.nombre.charAt(0).toUpperCase() + producto.nombre.slice(1)}</h4>
                                <p>Precio: $${producto.precio}<br>stock: ${producto.stock}</p>
                                <img src="${producto.img}" width="200px" height="200px">
                                <button class="btnAdd" id="${producto.id}">Añadir al carro</button>
            `

            producto.tipo === "simple" ? catalogoSimple.append(tarjeta) : catalogoPack.append(tarjeta)
        });

        // Botones para agregar al carrito
        btnAdd = document.getElementsByClassName('btnAdd')
        for (const boton of btnAdd) {

            boton.onclick = (x) => {

                const item = x.target.id

                // Cancelar si no hay stock
                if (stock.find((producto) => producto.id == item).stock < 1) {

                    //Notificacion al usuario
                    Toastify({

                        text: `No hay stock disponible`,
                        style: {
                            background: "linear-gradient(to right, rgb(255, 142, 142), rgb(247, 41, 41))",
                            color: "black"
                        },
                        duration: 1500
                    }).showToast()
                    return
                }
                
                // Sumar a objeto ya existente
                if (carro.some((producto) => producto.id == item)) {

                    // Cancelar si la cantidad en carro iguala al stock
                    if (stock.find((producto) => producto.id == item).stock <= carro.find((producto) => producto.id == item).cantidad) {

                        // Notificacion al usuario
                        Toastify({

                            style: {
                                background: "linear-gradient(to right, rgb(255, 142, 142), rgb(247, 41, 41))",
                                color: "black"
                            },
                            text: `Límite de stock alcanzado`,
                            duration: 1500
                        }).showToast();
                        return
                    }
 
                    // Actualizar carrito con objeto ya existente
                    carro = carro.map((producto) => {

                        if (producto.id == item) {

                            return {

                                id: producto.id,
                                nombre: producto.nombre,
                                precio: producto.precio,
                                img: producto.img,
                                cantidad: +producto.cantidad + 1
                            }
                        }

                        return producto
                    })

                    // Actualizar el display del carro
                    document.getElementById(`cantidad${item}`).innerHTML = `Cantidad: ${carro.find((producto) => producto.id == item).cantidad}`

                    // Actualizar precio en el carro
                    sumaTotal ()

                    // Notificacion al usuario con registro de productos actuales
                    Toastify({

                        style: {
                            background: "linear-gradient(to right, rgb(142, 255, 148), rgb(117, 247, 41))",
                            color: "black"
                        },
                        text: `Producto añadido (${carro.find((producto) => producto.id == item).cantidad})`,
                        duration: 1500
                    }).showToast();

                    // Actualizar localstorage
                    localStorage.setItem('carro', JSON.stringify(carro))
                    return
                }
                    
                // Crear nuevo producto en carrito si no existe previamente
                carro = carro.concat(stock.filter((producto) => producto.id == item).map((producto) => {

                    return {
                        id: producto.id,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        img: producto.img,
                        cantidad: 1
                    }
                }))

                // Crear tarjeta para el display
                itemCarro = document.createElement('div')

                infoProd = carro.find((producto) => producto.id == item)    // Variable auxiliar para failitar escritura

                itemCarro.className = 'itemCarro'
                itemCarro.id = `carro${infoProd.id}`
                itemCarro.innerHTML =   `<img src="${infoProd.img}" width="70px" height="70px">
                                        <p>${infoProd.nombre.charAt(0).toUpperCase() + infoProd.nombre.slice(1)}</p>
                                        <p>Precio:<br>$${infoProd.precio}</p>
                                        <p id="cantidad${infoProd.id}">Cantidad:<br>${infoProd.cantidad}</p>
                                        <button onclick="carritoDel(${infoProd.id})"><img src="./assets/basura.png"></button>
                                        `
                
                carroDisplay.append(itemCarro)

                // Actualizar precio en el carro
                sumaTotal ()

                // Notificacion al usuario
                Toastify({

                    style: {
                        background: "linear-gradient(to right, rgb(142, 255, 148), rgb(117, 247, 41))",
                        color: "black"
                    },
                    text: "Producto añadido",
                    duration: 1500
                }).showToast()

                // actualizar localstorage
                localStorage.setItem('carro', JSON.stringify(carro))
            }
        }
    })

// Boton de limpieza de carro
limpiar.onclick = () => {

    //Excepcion carro vacio
    if (carro.length === 0) {

        Toastify({
        
            text: "Su carro de compras ya se encuentra vacio",
            duration: 1500
        }).showToast()

        return
    }

    //Vaciar carro, display, localstorage y suma
    document.querySelectorAll('.itemCarro').forEach(tarjeta => {

        tarjeta.remove()
    })
    localStorage.clear()
    carro = []
    sumaTotal ()

    // Notificacion al usuario
    Toastify({
        
        style: {
            background: "linear-gradient(to right, rgb(142, 255, 148), rgb(117, 247, 41))",
            color: "black"
        },
        text: "Su carro de compras ha sido vaciado",
        duration: 1500
    }).showToast()
}

// Boton de confirmacion de compra
comprar.onclick = () => {

    //Excepcion carro vacio
    if (carro.length === 0) {

        Toastify({
            
            style: {
                background: "linear-gradient(to right, rgb(255, 142, 142), rgb(247, 41, 41))",
                color: "black"
            },
            text: "Su carro de compras se encuentra vacio",
            duration: 1500
        }).showToast()

        return
    }

    //Vaciar carro, display, localstorage y suma
    document.querySelectorAll('.itemCarro').forEach(tarjeta => {

        tarjeta.remove()
    })
    localStorage.clear()
    carro = []
    sumaTotal ()

    // Notificacion al usuario
    Swal.fire ({

        iconColor: 'rgb(7, 207, 214)',
        confirmButtonColor: '#f8615e',
        background: '#d48684',
        color: 'black',
        title: 'Compra realizada',
        text: 'Su compra ha sido realizada con éxito, se procesarán los datos de envío.',
        icon: 'success',
        confirmButtonText: 'Continuar'
    })
}

// Boton de ocultar y revelar carro de compras

// Desactivo la animacion previamente para coordinarse con revelacion
carroDisplay.classList.toggle('animBajar') 

mostrarCarro.onclick = () => {

    carroDisplay.classList.toggle('ocultar')
    carroDisplay.classList.toggle('animBajar')
}