const conteudo = document.getElementById("conteudo");

function carregar(pagina) {

    if (pagina === "home") {
        conteudo.innerHTML = `
            <h2>O que é Desenvolvimento de Jogos?</h2>
            <p>
                Desenvolvimento de jogos é o processo de criação de jogos digitais,
                envolvendo programação, design, gráficos e lógica.
            </p>
            <p>
                Este site apresenta conceitos básicos para quem está começando
                no mundo do Game Dev.
            </p>
            <img src="assets/images/codigo.jpg" class="img-codigo">
        `;
    }

    if (pagina === "engines") {
        conteudo.innerHTML = `
           
        <div class="engines-container">
            <h2>Game Engines</h2>
            <p>Uma game engine facilita o desenvolvimento de jogos.</p>
            <ul class = lista-engines>
                <li><strong>Unity:</strong> Muito usada por iniciantes</li>
                <li><strong>Unreal Engine:</strong> Gráficos avançados</li>
                <li><strong>Godot:</strong> Open source</li>
                <li><strong>GameMaker:</strong> Ideal para jogos 2D</li>
            </ul>
            
           <img src="assets/images/unreal-image.jpg" class="img-engines">
        </div>
           `;
    }

    if (pagina === "linguagens") {
        conteudo.innerHTML = `
            <h2>Linguagens de Programação</h2>
            <ul>
                <li><strong>C#:</strong> Usada na Unity</li>
                <li><strong>C++:</strong> Usada na Unreal</li>
                <li><strong>GDScript:</strong> Linguagem da Godot</li>
                <li><strong>Python:</strong> Boa para aprendizado</li>
            </ul>
        `;
    }

    if (pagina === "dicas") {
        conteudo.innerHTML = `
            <h2>Dicas para Iniciantes</h2>
            <ul>
                <li>Comece com jogos simples</li>
                <li>Aprenda lógica de programação</li>
                <li>Não pule etapas</li>
                <li>Use a documentação oficial</li>
                <li>Pratique bastante</li>
            </ul>
        `;
    }

    if (pagina === "sobre") {
        conteudo.innerHTML = `
            <h2>Sobre o Projeto</h2>
            <p>
                Este site foi desenvolvido como um projeto acadêmico
                para praticar HTML, CSS e JavaScript básico.
            </p>
        `;
    }
}



// Carrega a Home automaticamente
carregar("home");

function aceitarCookies() {
    localStorage.setItem("cookiesAceitos", "true");
    document.getElementById("cookie-banner").style.display = "none";
}

window.onload = function () {
    if (localStorage.getItem("cookiesAceitos") === "true") {
        document.getElementById("cookie-banner").style.display = "none";
    }
};

