// aqui lo mero bueno 

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELECCIONAR ELEMENTOS 
    const buscador = document.getElementById('buscador');
    const modal = document.getElementById('modal-detalle');
    const modalCerrar = document.getElementById('modal-cerrar');
    const modalCuerpo = document.getElementById('modal-cuerpo');
    const menuToggle = document.getElementById('menu-toggle');
    const menuCategorias = document.getElementById('menu-categorias');
    const mainContent = document.querySelector('main.container'); // Contenedor principal
    
    // Vistas de la poke
    const carouselContainer = document.getElementById('animal-carousel');
    const carouselSlides = carouselContainer.querySelector('.carousel-slides');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pokedexGrid = document.getElementById('pokedex-grid'); 

    // --- 2. SELECCIONAR ELEMENTOS (JUEGO) ---
    const gameOverlay = document.getElementById('game-overlay');
    const startGameBtn = document.getElementById('start-game-btn');
    const gameExitBtn = document.getElementById('game-exit-btn');
    const silhouetteImg = document.getElementById('silhouette-img');
    const choiceButtonsContainer = document.getElementById('choice-buttons');
    const gameFeedback = document.getElementById('game-feedback');
    const nextAnimalBtn = document.getElementById('next-animal-btn');

    // --- 3. SONIDOS  comentados hasta que los consiga  ---
    const beepSound = new Audio('beep.mp3'); 
    const successSound = new Audio('success.mp3'); 
    const failSound = new Audio('fail.mp3');     
    
    // --- 4. VARIABLES DE ESTADO ---
    let todosLosAnimales = []; 
    let animalesActualesEnCarrusel = []; 
    let slideActual = 0;
    let correctAnimalForRound; // Para el juego

    // logica de la pagina 

    // --- Carga Inicial ---
    async function cargarAnimales() { // cargar animales al carru
        try {
            const respuesta = await fetch('animales.json'); //llamar la bd
            todosLosAnimales = await respuesta.json(); // respuesta de la bd
            // Inicia en modo Carrusel
            mostrarVistaCarrusel(todosLosAnimales);

        } catch (error) {
            console.error('Error al cargar los animales:', error);
            carouselContainer.innerHTML = '<p>No se pudieron cargar los animales.</p>';
        }
    }

    // --- Control de Vistas ---
    function mostrarVistaCarrusel(listaAnimales) {
        // Mostrar carrusel y ocultar cuadritos 
        carouselContainer.style.display = 'block';
        pokedexGrid.style.display = 'none';
        mainContent.style.display = 'block';
        gameOverlay.style.display = 'none';
        
        // Construir el carrusel
        construirCarousel(listaAnimales);
    }

    function mostrarVistaGrid(listaAnimales) {
        // Mostrar cuadritos y ocultar carrusel/juego
        carouselContainer.style.display = 'none';
        pokedexGrid.style.display = 'grid'; // 'grid' para que se vea
        mainContent.style.display = 'block';
        gameOverlay.style.display = 'none';
        
        // Construir la cuadrícula
        mostrarAnimalesEnGrid(listaAnimales);
    }

    // --- Constructores de Vistas ---
    function construirCarousel(listaAnimales) {
        carouselSlides.innerHTML = '';
        animalesActualesEnCarrusel = [...listaAnimales]; 

        if (animalesActualesEnCarrusel.length === 0) {
            carouselSlides.innerHTML = `<div class="carousel-slide"><h3>No se encontraron animales</h3></div>`;
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        animalesActualesEnCarrusel.forEach(animal => {
            const slide = document.createElement('div');
            slide.classList.add('carousel-slide');
            slide.dataset.id = animal.id;
            slide.innerHTML = `
                <img src="${animal.imagen}" alt="${animal.nombre}">
                <div class="card-info">
                    <span class="card-id">N° ${animal.id.toString().padStart(3, '0')}</span>
                    <h3>${animal.nombre}</h3>
                </div>
            `;
            carouselSlides.appendChild(slide);
        });

        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
        slideActual = 0;
        actualizarPosicionCarousel();
    }
    
    function mostrarAnimalesEnGrid(listaAnimales) {
        pokedexGrid.innerHTML = ''; // Limpiamos la cuadrícula

        if (listaAnimales.length === 0) {
            pokedexGrid.innerHTML = '<p>No se encontraron animales.</p>';
            return;
        }

        listaAnimales.forEach(animal => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.id = animal.id; // Para el clic

            card.innerHTML = `
                <div class="card-img-container">
                    <img src="${animal.imagen}" alt="${animal.nombre}">
                </div>
                <div class="card-info">
                    <span class="card-id">N° ${animal.id.toString().padStart(3, '0')}</span>
                    <h3>${animal.nombre}</h3>
                    <span class="card-categoria ${animal.categoria}">${animal.categoria}</span>
                </div>
            `;
            pokedexGrid.appendChild(card);
        });
    }

    // --- Controles del Carrusel ---
    function actualizarPosicionCarousel() {
        carouselSlides.style.transform = `translateX(-${slideActual * 100}%)`;
    }

    function siguienteSlide() {
        beepSound.play();
        slideActual++;
        if (slideActual >= animalesActualesEnCarrusel.length) slideActual = 0; 
        actualizarPosicionCarousel();
    }

    function anteriorSlide() {
        beepSound.play();
        slideActual--;
        if (slideActual < 0) slideActual = animalesActualesEnCarrusel.length - 1;
        actualizarPosicionCarousel();
    }

    // --- Modal de Detalles (con Voz) ---
    function mostrarDetalle(animal) {
        modalCuerpo.innerHTML = `
            <h2>${animal.nombre} (${animal.nombreCientifico})</h2>
            <img src="${animal.imagen}" alt="${animal.nombre}" style="width:100%; max-width:400px; margin-bottom:15px;">
            <p><strong>Categoría:</strong> <span class="card-categoria ${animal.categoria}">${animal.categoria}</span></p>
            <p><strong>Hábitat:</strong> ${animal.habitat}</p>
            <p><strong>Dato Curioso:</strong> ${animal.datoCurioso}</p>
        `;
        modal.classList.add('visible');

        // --- Código de Voz ---
        window.speechSynthesis.cancel(); 
        const textoParaLeer = `
            ${animal.nombre}. Nombre científico: ${animal.nombreCientifico}.
            Categoría: ${animal.categoria}. Hábitat: ${animal.habitat}.
            Dato curioso: ${animal.datoCurioso}.
        `;
        const utterance = new SpeechSynthesisUtterance(textoParaLeer);
        utterance.rate = 0.9;
        const nombreVozPreferida = 'Microsoft Sabina - Spanish (Mexico)'; 
        const voices = window.speechSynthesis.getVoices();
        let vozElegida = voices.find(voice => voice.name === nombreVozPreferida);
        if (!vozElegida) vozElegida = voices.find(voice => voice.lang === 'es-MX');
        if (vozElegida) utterance.voice = vozElegida;
        else utterance.lang = 'es-MX';
        window.speechSynthesis.speak(utterance);
    }

    // --- ESCUCHADORES 
    buscador.addEventListener('keyup', (e) => {
        const textoBusqueda = e.target.value.toLowerCase();
        const animalesFiltrados = todosLosAnimales.filter(animal => {
            return animal.nombre.toLowerCase().includes(textoBusqueda) || 
                   animal.nombreCientifico.toLowerCase().includes(textoBusqueda);
        });
        // Cambia a la vista de los cuadrito con los resultados
        mostrarVistaGrid(animalesFiltrados);
    });
    
    carouselSlides.addEventListener('click', (e) => {
        const slide = e.target.closest('.carousel-slide');
        if (!slide || animalesActualesEnCarrusel.length === 0) return;
        const animalId = parseInt(slide.dataset.id);
        const animalEncontrado = todosLosAnimales.find(animal => animal.id === animalId);
        if (animalEncontrado) mostrarDetalle(animalEncontrado);
    });
    
    pokedexGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;
        const animalId = parseInt(card.dataset.id);
        const animalEncontrado = todosLosAnimales.find(animal => animal.id === animalId);
        if (animalEncontrado) mostrarDetalle(animalEncontrado);
    });

    prevBtn.addEventListener('click', anteriorSlide);
    nextBtn.addEventListener('click', siguienteSlide);

    modalCerrar.addEventListener('click', () => {
        modal.classList.remove('visible');
        window.speechSynthesis.cancel(); 
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('visible');
            window.speechSynthesis.cancel();
        }
    });

    menuToggle.addEventListener('click', () => {
        menuCategorias.classList.toggle('active');
    });

    menuCategorias.addEventListener('click', (e) => {
        // Filtro de categoría
        if (e.target.classList.contains('filtro-categoria')) {
            e.preventDefault(); 
            const categoria = e.target.dataset.categoria;
            buscador.value = '';
            if (categoria === 'Todos') {
                mostrarVistaCarrusel(todosLosAnimales);
            } else {
                const animalesFiltrados = todosLosAnimales.filter(a => a.categoria === categoria);
                mostrarVistaGrid(animalesFiltrados);
            }
            menuCategorias.classList.remove('active');
        }
    });

    //  LÓGICA DEL JUEGO
    
    

    function startGame() {
        // Ocultar la poke y mostrar el juego
        mainContent.style.display = 'none';
        gameOverlay.style.display = 'flex';
        menuCategorias.classList.remove('active'); // Cierra el menú
        
        // Iniciar la primera ronda
        setupNewRound();
    }

    function exitGame() {
        // Ocultar el juego y mostrar la poke
        gameOverlay.style.display = 'none';
        mostrarVistaCarrusel(todosLosAnimales); // Regresa a la vista principal
    }

    function setupNewRound() {
        // 1. Resetear UI
        gameFeedback.textContent = '';
        nextAnimalBtn.style.display = 'none';
        choiceButtonsContainer.innerHTML = '';
        silhouetteImg.classList.remove('revealed');
        
        // 2. Elegir animal correcto
        correctAnimalForRound = todosLosAnimales[Math.floor(Math.random() * todosLosAnimales.length)];
        
        // 3. Elegir 3 animales incorrectos (que no sean el correcto ni repetidos)
        let wrongAnswers = [];
        while (wrongAnswers.length < 3) {
            let randomAnimal = todosLosAnimales[Math.floor(Math.random() * todosLosAnimales.length)];
            if (randomAnimal.id !== correctAnimalForRound.id && !wrongAnswers.find(a => a.id === randomAnimal.id)) {
                wrongAnswers.push(randomAnimal);
            }
        }
        
        // 4. Juntar y barajar las 4 opciones
        let options = [correctAnimalForRound, ...wrongAnswers];
        options.sort(() => Math.random() - 0.5); // Baraja el array
        
        // 5. Poner la silueta
        silhouetteImg.src = correctAnimalForRound.imagen;
        
        // 6. Crear botones de opción
        options.forEach(animal => {
            const button = document.createElement('button');
            button.textContent = animal.nombre;
            button.dataset.id = animal.id;
            choiceButtonsContainer.appendChild(button);
        });
    }

    function checkAnswer(e) {
        // Solo reacciona si se hizo clic en un botón de opción
        if (e.target.tagName !== 'BUTTON' || !e.target.dataset.id) return;

        const clickedButton = e.target;
        const animalId = parseInt(clickedButton.dataset.id);

        // Desactivar todos los botones para evitar más clics
        const allButtons = choiceButtonsContainer.querySelectorAll('button');
        allButtons.forEach(btn => btn.disabled = true);

        if (animalId === correctAnimalForRound.id) {
            // --- ¡CORRECTO! ---
            successSound.play();
            gameFeedback.textContent = '¡Correcto!';
            gameFeedback.style.color = 'lightgreen';
            clickedButton.classList.add('correct');
            
            // Revelar imagen y mostrar botón 'Siguiente'
            silhouetteImg.classList.add('revealed');
            nextAnimalBtn.style.display = 'inline-block';
            
        } else {
            // --- INCORRECTO ---
            failSound.play();
            gameFeedback.textContent = `Incorrecto. Es un ${correctAnimalForRound.nombre}.`;
            gameFeedback.style.color = 'salmon';
            clickedButton.classList.add('wrong');
            
            // También muestra la respuesta correcta
            allButtons.forEach(btn => {
                if (parseInt(btn.dataset.id) === correctAnimalForRound.id) {
                    btn.classList.add('correct');
                }
            });

            // Revelar imagen y mostrar botón 'Siguiente'
            silhouetteImg.classList.add('revealed');
            nextAnimalBtn.style.display = 'inline-block';
        }
    }

    // --- ESCUCHADORES (JUEGO) ---
    // (Añadido al listener del menú)
    menuCategorias.addEventListener('click', (e) => {
        if(e.target.id === 'start-game-btn') {
            e.preventDefault();
            startGame();
        }
    });

    gameExitBtn.addEventListener('click', exitGame);
    nextAnimalBtn.addEventListener('click', setupNewRound);
    choiceButtonsContainer.addEventListener('click', checkAnswer);

    // --- INICIAR LA APP ---
    window.speechSynthesis.getVoices(); // Precarga las voces
    cargarAnimales();
});