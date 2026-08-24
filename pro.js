const peso = document.getElementById('pesoChart');

new Chart(peso,{
type:'line',
data:{
labels:['Jan','Fev','Mar','Abr','Mai','Jun'],
datasets:[{
label:'Peso',
data:[5,7,8,10,9,11],
borderColor:'#4bc0c0',
tension:0.3
}]
}
});

const altura = document.getElementById('alturaChart');

new Chart(altura,{
type:'line',
data:{
labels:['Jan','Fev','Mar','Abr','Mai','Jun'],
datasets:[{
label:'Altura',
data:[50,55,60,65,70,75],
borderColor:'#2ecc71',
tension:0.3
}]
}
});