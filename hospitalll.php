<?php

include("conexao.php");

$hospital = $_POST['hospital'];
$problema = $_POST['problemaHospital'];
$denunciante = $_POST['nomeDenunciante'];
$contacto = $_POST['contato'];

$sql = $conexao->prepare(

"INSERT INTO denuncias_hospital
(hospital, problema, denunciante, contacto)

VALUES (?, ?, ?, ?)"

);

$sql->bind_param(
"ssss",
$hospital,
$problema,
$denunciante,
$contacto
);

if($sql->execute()){

    echo "Denúncia enviada.";

}else{

    echo "Erro.";

}

$sql->close();
$conexao->close();

?>