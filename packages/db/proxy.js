const net = require('net');

const server = net.createServer(client => {
  const remote = net.connect(5432, '2600:1f18:2e13:9d4d:29cd:a25b:1980:c0b9');
  client.pipe(remote);
  remote.pipe(client);
  remote.on('error', err => console.error(err));
  client.on('error', err => console.error(err));
});
server.listen(54321, () => {
  console.log('Listening on 54321');
});
