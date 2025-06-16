let carro;
let xCarro, yCarro;
let larguraCarro = 40;
let alturaCarro = 70;
let velocidadeCarro = 5; // Velocidade de movimento horizontal do carro

let verduras = []; // Array para armazenar as verduras na estrada
let velocidadeObjetos = 4; // Velocidade com que as verduras e árvores descem
let intervaloGeracaoVerdura = 60; // A cada 60 frames (aprox. 1 segundo) uma nova verdura
let intervaloGeracaoArvore = 90; // A cada 90 frames uma nova árvore

let arvores = []; // Array para armazenar as árvores
let xOffsetArvoresEsquerda = 40; // Deslocamento para as árvores da esquerda
let xOffsetArvoresDireita = 360; // Deslocamento para as árvores da direita

let pontos = 0;
let jogoGanho = false;
let modoChegarCidade = false; // Novo estado: true quando atingir 20 pontos

let larguraEstrada = 300;
let xEstrada; // Posição X do centro da estrada

const PONTOS_PARA_TRANSICAO = 20; // Meta de pontos para mudar para o modo "chegar à cidade"

let xCidadeFinal = width / 2 - 50; // Posição X da cidade final
let yCidadeFinal = -150; // Posição Y da cidade final (começa fora da tela, desce)

function setup() {
  createCanvas(400, 600); // Tela mais alta para simular a estrada
  xCarro = width / 2 - larguraCarro / 2; // Carro começa no centro horizontal
  yCarro = height - 100; // Carro na parte de baixo da tela

  xEstrada = width / 2 - larguraEstrada / 2; // Posição inicial da estrada

  // Gera algumas árvores iniciais para preencher a tela
  for (let i = 0; i < 5; i++) {
    arvores.push({
      x: xOffsetArvoresEsquerda + random(-10, 10),
      y: random(height),
      lado: 'esquerda'
    });
    arvores.push({
      x: xOffsetArvoresDireita + random(-10, 10),
      y: random(height),
      lado: 'direita'
    });
  }
}

function draw() {
  if (jogoGanho) {
    telaVitoria();
    return; // Para de desenhar o resto do jogo se o jogo foi ganho
  }

  // Gramado (fundo)
  background(34, 139, 34); // Verde grama

  // Estrada
  fill(80); // Cinza escuro para a estrada
  rect(xEstrada, 0, larguraEstrada, height);

  // Faixas da estrada (linhas brancas)
  for (let i = 0; i < height; i += 50) {
    fill(255);
    rect(width / 2 - 5, i, 10, 30);
  }

  // Desenhar e mover as árvores
  for (let i = arvores.length - 1; i >= 0; i--) {
    desenharArvore(arvores[i].x, arvores[i].y);
    arvores[i].y += velocidadeObjetos;

    // Remover árvore se sair da tela
    if (arvores[i].y > height + 50) {
      arvores.splice(i, 1);
    }
  }

  // Gerar novas árvores
  if (frameCount % intervaloGeracaoArvore === 0) {
    // Alterna a geração entre os dois lados do gramado
    if (random() > 0.5) {
      arvores.push({
        x: xOffsetArvoresEsquerda + random(-10, 10),
        y: -50,
        lado: 'esquerda'
      });
    } else {
      arvores.push({
        x: xOffsetArvoresDireita + random(-10, 10),
        y: -50,
        lado: 'direita'
      });
    }
  }

  // Lógica para modo "coletar verduras" ou "chegar à cidade"
  if (!modoChegarCidade) {
    // Desenhar e mover as verduras
    for (let i = verduras.length - 1; i >= 0; i--) {
      fill(0, 200, 0); // Verde para a verdura
      ellipse(verduras[i].x, verduras[i].y, 20, 20); // Desenha a verdura
      verduras[i].y += velocidadeObjetos;

      // Remover verdura se sair da tela
      if (verduras[i].y > height) {
        verduras.splice(i, 1);
      }

      // Verificar colisão com o carro
      if (
        verduras[i].x > xCarro &&
        verduras[i].x < xCarro + larguraCarro &&
        verduras[i].y > yCarro &&
        verduras[i].y < yCarro + alturaCarro
      ) {
        pontos++; // Aumenta a pontuação
        verduras.splice(i, 1); // Remove a verdura coletada
      }
    }

    // Gerar novas verduras
    if (frameCount % intervaloGeracaoVerdura === 0) {
      let novaVerduraX = random(xEstrada + 30, xEstrada + larguraEstrada - 30); // Gera na estrada
      verduras.push({
        x: novaVerduraX,
        y: -20
      }); // Começa no topo da tela
    }

    // Verificar transição para o modo cidade
    if (pontos >= PONTOS_PARA_TRANSICAO) {
      modoChegarCidade = true;
      verduras = []; // Limpa todas as verduras existentes
    }

  } else { // Modo "chegar à cidade"
    // Desenhar a cidade final
    desenharCidadeFinal(xCidadeFinal, yCidadeFinal);
    yCidadeFinal += velocidadeObjetos; // A cidade "desce" em direção ao carro

    // Verificar se o carro chegou à cidade final
    // A cidade final é considerada "alcançada" quando sua base passa do y do carro
    if (yCidadeFinal > yCarro - 50) { // Ajuste esse valor conforme o tamanho da cidade
        jogoGanho = true;
    }
    // Para a cidade de descer quando ela passa do final da tela
    if (yCidadeFinal > height + 50) {
        yCidadeFinal = height + 50; // Para não ir infinitamente pra baixo
    }

    // Mensagem de objetivo
    fill(255, 255, 0); // Amarelo
    textSize(28);
    textAlign(CENTER, TOP);
    text("CHEGUE À CIDADE!", width / 2, 50);
  }


  // Desenhar o carro
  desenharCarro(xCarro, yCarro);

  // Controlar o carro
  moverCarro();

  // Exibir a pontuação
  fill(255); // Branco para o texto
  textSize(24);
  textAlign(LEFT, TOP); // Garante que a pontuação não seja centralizada
  text("Pontos: " + pontos, 10, 30);
}

// Função para desenhar o carro
function desenharCarro(x, y) {
  // Corpo principal do carro
  fill(255, 0, 0); // Vermelho
  rect(x, y, larguraCarro, alturaCarro);

  // Janela (pára-brisa)
  fill(173, 216, 230); // Azul claro
  rect(x + 5, y + 5, larguraCarro - 10, 20);

  // Rodas
  fill(50); // Cinza escuro
  ellipse(x + 10, y + alturaCarro - 10, 15, 15);
  ellipse(x + larguraCarro - 10, y + alturaCarro - 10, 15, 15);
  ellipse(x + 10, y + 10, 15, 15);
  ellipse(x + larguraCarro - 10, y + 10, 15, 15);
}

// Função para desenhar uma árvore
function desenharArvore(x, y) {
  // Tronco
  fill(139, 69, 19); // Marrom
  rect(x, y, 15, 40);

  // Folhagem
  fill(34, 139, 34); // Verde escuro
  ellipse(x + 7, y, 50, 50);
}

// Função para desenhar a cidade final (objetivo)
function desenharCidadeFinal(x, y) {
  fill(150); // Cor cinza para os edifícios
  rect(x, y, 100, 100); // Base da cidade
  rect(x + 10, y - 50, 30, 50); // Edifício 1
  rect(x + 60, y - 70, 35, 70); // Edifício 2 (mais alto)
  fill(200, 200, 0); // Janelas
  rect(x + 15, y - 40, 5, 10);
  rect(x + 65, y - 60, 5, 10);
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("CIDADE", x + 50, y + 50);
}


// Função para controlar o carro com as setas do teclado
function moverCarro() {
  if (keyIsDown(LEFT_ARROW)) {
    xCarro -= velocidadeCarro;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    xCarro += velocidadeCarro;
  }

  // Limitar o carro à estrada
  xCarro = constrain(xCarro, xEstrada, xEstrada + larguraEstrada - larguraCarro);
}

// Função para exibir a tela de vitória
function telaVitoria() {
  background(50, 205, 50); // Fundo verde vibrante
  fill(255); // Texto branco
  textAlign(CENTER, CENTER);
  textSize(50);
  text("VOCÊ GANHOU!", width / 2, height / 2 - 50);
  textSize(30);
  if (modoChegarCidade) {
    text("Você chegou à cidade!", width / 2, height / 2);
  } else {
    text("Você coletou " + PONTOS_PARA_TRANSICAO + " verduras!", width / 2, height / 2);
  }
  textSize(20);
  text("Pressione 'R' para jogar novamente", width / 2, height / 2 + 50);
}

// Função para reiniciar o jogo quando 'R' é pressionado
function keyPressed() {
  if (jogoGanho && (key === 'r' || key === 'R')) {
    reiniciarJogo();
  }
}

function reiniciarJogo() {
  pontos = 0;
  jogoGanho = false;
  modoChegarCidade = false;
  xCarro = width / 2 - larguraCarro / 2;
  yCarro = height - 100;
  verduras = []; // Limpa todas as verduras
  arvores = []; // Limpa todas as árvores
  yCidadeFinal = -150; // Reinicia a posição da cidade final

  // Re-gera algumas árvores iniciais
  for (let i = 0; i < 5; i++) {
    arvores.push({
      x: xOffsetArvoresEsquerda + random(-10, 10),
      y: random(height),
      lado: 'esquerda'
    });
    arvores.push({
      x: xOffsetArvoresDireita + random(-10, 10),
      y: random(height),
      lado: 'direita'
    });
  }
}