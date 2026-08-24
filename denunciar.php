<?php

include("conexao.php");

$nome = $_POST['nomeCrianca'];
$idade = $_POST['idadeCrianca'];
$localidade = $_POST['localidade'];
$descricao = $_POST['descricao'];

$sql = $conexao->prepare(

"INSERT INTO denuncias_desnutricao
(nome_crianca, idade, localidade, descricao)

VALUES (?, ?, ?, ?)"

);

$sql->bind_param(
"siss",
$nome,
$idade,
$localidade,
$descricao
);

if($sql->execute()){

    echo "Denúncia enviada.";

}else{

    echo "Erro.";

}

$sql->close();
$conexao->close();

?>