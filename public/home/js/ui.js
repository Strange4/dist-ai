const conAlert = document.getElementById('con-alert');
conAlert.addEventListener('disconnected', ()=>{
    conAlert.style.opacity = '1';
});

window.addEventListener('resize', ()=>{ ng.updateCenter() });