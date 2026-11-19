export function testDesktopNotification(){
 if(!('Notification' in window)||Notification.permission!=='granted')throw Error('Permita as notificações deste site no Chrome.');
 const notification=new Notification('Notificações ativadas · Planejamentos',{
  body:'Teste de recebimento. Novas artes em aprovação aparecerão aqui.',
  icon:'/favicon-luke-group.png',tag:'marketing-notification-test',
 });
 notification.onclick=()=>{window.focus();notification.close()};
}
