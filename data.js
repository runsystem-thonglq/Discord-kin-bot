const queues = new Map();

module.exports = {
  getQueue: (channelId) => queues.get(channelId),
  setQueue: (channelId, queue) => queues.set(channelId, queue),
  deleteQueue: (channelId) => queues.delete(channelId),
  getAllQueues: () => queues
};