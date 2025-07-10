/**
 * @description 简单异步队列，处理上传
 * @returns
 */

type Task = () => Promise<void>

const useSimpleQueue = function () {
  const limit = 10
  const taskQueue: {
    task: Task
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
  }[] = []
  let runningConut = 0

  let complete: (value?: unknown) => void

  const suspend = new Promise((resolve) => {
    complete = resolve
  })

  function enqueue(task: Task) {
    return new Promise((resolve, reject) => {
      taskQueue.push({
        task,
        resolve,
        reject,
      })
      handleQueue()
    })
  }

  async function handleQueue() {
    while (runningConut < limit && taskQueue.length > 0) {
      const { task, resolve, reject } = taskQueue.shift()
      runningConut++
      try {
        const result = await task()
        resolve(result)
      }
      catch (err) {
        reject(err)
      }
      finally {
        runningConut--
        handleQueue()
        if (runningConut === 0) {
          complete()
        }
      }
    }
  }

  return {
    enqueue,
    suspend,
  }
}

const fileSizeRenderFormat = (bytes: number, unit: 'KB') => {
  switch (unit) {
    case 'KB':
      return `${(bytes / 1024).toFixed(2)} KB`
    default:
      return `${bytes} B`
  }
}

export {
  useSimpleQueue,
  fileSizeRenderFormat,
}
