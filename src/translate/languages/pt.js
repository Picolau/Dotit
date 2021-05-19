const ptMessages = { 
    pt: {
        translations: {
            menu: {
                continue: "Continuar Jogo",
                new: "Começar Novo Jogo",
                challenge: "Desafio de Hoje",
                load: "Carregar um Padrão",
                create: "Criar um Padrão",
                color: "Cor de Fundo"
            },
            messages: {
                tutorial: [
                    "Olá!;Bem-vindo ao Joid\xF4!;Nesse jogo você simplesmente deve tentar desenhar a figura fornecida;Dê uma chance :)",
                    "Bem fácil, né?;Tente esse aqui.",
                    "Bom trabalho! Acho que você pegou o jeito;Consegue fazer essa outra figura?",
                    "Que maravilha!;Continue assim...;E saiba, caso precise, use uma dica! Você as ganha para cada 3 figuras completas.",
                    "Uau, meus parabéns! Estou impressionado!; OK, aqui vai um truque: você pode reconectar pontos clicando neles caso você tenha alguns cliques extra!;O número de cliques extra podem ser vistos ali em cima;Vá em frente e veja como se sai.",
                    "OK! Posso sentir que pegou o espírito da coisa!; Consegue fazer esse?!",
                    "Isso é incrível!;Quero dizer... Você é incrível!; Vamos tentar desenhar algumas coisas legais!; O que acha do meu barquinho?",
                    "Que ótimo, estou tão feliz!; Vamos desenhar uma estrela para celebrar!",
                    "E agora, Espero que isso pareça uma pipa!; Consegue fazer usando os 3 cliques extra?",
                    "Muito bom, o tutorial acaba por aqui!;São 90 níveis no total, que tendem a crescer em dificuldade conforme você avança.;Espero que aproveite o resto do jogo, boa sorte!",
                ],
                continue: "Clique/Toque por perto para prosseguir",
                clipboard: {
                    success: "!Copiado com sucesso",
                    error: ".Erro ao copiar",
                },
                loadLevel: {
                    info: "Cole o código da figura aqui e pressione Enter!",
                    error: "Esse código está incorreto. Por favor, verifique-o e tente novamente.",
                } 
            },
            info: {
                extra: "Extra",
                tips: "Dicas",
                free: "Livre",
            },
            endScreen: {
                congratulationsText: "Parabéns!",
                congratulations1: "Você conseguiu! Muito obrigado por jogar Joidô! Felizmente, as coisas não param por aqui... Você mesmo pode criar padrões e compartilhá-los com seus amigos, ou pode também carregar um padrão feito por eles! Aah e desafios diários estarão disponíveis para você, e se quiser pode jogar o jogo inteiro novamente, acessando 'Começar novo jogo' no menu.",
                congratulations2: "Estamos abertos para receber feedbacks ou sugestões para melhorar o jogo, então nos envie uma mensagem no instagram caso queira, ficaremos muito feliz em saber de você! Aproveite e nos envie alguns de seus padrões criados, se forem legais e desafiadores, podemos colocá-los nos desafios diários e te marcar como o idealizador :D",
                congratulations3: "Aqui embaixo você pode ver os resultados da sua performance comparados com os outros que também zeraram o jogo. Também temos algumas curiosidades e histórias sobre nós e a criação desse jogo. Muito obrigado novamente e tenha um ótimo dia!",

                resultsText: "Resultados",
                youOthersText: " (Você / Outros)",
                betterThan: "Você foi melhor que ",
                ofPeople: " das pessoas",
                totalTimeText: "Tempo total de jogo: ",
                totalRetriesText: "Total de retentativas: ",
                totalHintsText: "Total de dicas: ",
                theLevel: "O nível ",
                maxTimeText: " foi o que você mais demorou para resolver: ",
                maxRetriesText: " foi o que você mais gastou retentativas: ",
                maxHintsText: " foi o que você mais gastou dicas: ",

                curiositiesText: "Curiosidades",
                curiositiesInfo: "Ok, para aqueles que estão aqui, temos algumas curiosidades : ",
                curiosities1: "O nome Joidô vem de cortar e concatenar as palavras 'Join' e 'Dots' (do inglês, 'juntar' e 'pontos', respectivamente). Soou legal e ficou!",
                curiosities2: "Não precisa nem dizer que esse jogo foi inspirado pelos padrões de senha dos celulares modernos. Um de nossos amigos estava vendo quais tipos de padrões ele conseguia desenhar em seu celular; Bom, ele eventualmente começou a desenhar alguns padrões muito desafiadores e a ideia foi crescendo a partir daí.",
                curiosities3: "Initially, this game was to be released as a native Android app, but we didn't know how to do some crazy good animations back there. Then we learned some javascript over the years and the thing kinda grew!",
                curiosities4: "There's no algorithm to check the minimum amount of clicks possible to perform a given pattern, we just had to brute force trial and error until we guessed what would be the optimal solution. (Wish you good luck if you are going to try to implement it :D)",
            }
        }
    }
}

export { ptMessages }