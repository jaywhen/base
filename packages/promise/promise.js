class Promis {
  #pending = "pending";

  #fulfilled = "fulfilled";

  #rejected = "rejected";

  constructor(executor) {
    this.PromiseState = this.#pending;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.PromiseState === this.#pending) {
        this.PromiseState = this.#fulfilled;
        this.value = value;
        this.onFulfilledCallbacks.forEach((cb) => cb(value));
      }
    };

    const reject = (reason) => {
      if (this.PromiseState === this.#pending) {
        this.PromiseState = this.#rejected;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((cb) => cb(reason));
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    /**
     * 如果onFulfilled或者onRejected不是函数，则把值忽略掉
     */
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    const promise = new Promis((resolve, reject) => {
      if (this.PromiseState === this.#fulfilled) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.PromiseState === this.#rejected) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.PromiseState === this.#pending) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              this.resolvePromise(promise, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              this.resolvePromise(promise, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise;
  }

  resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
      return reject(new TypeError("Chaining cycle detected for promise"));
    }

    if (x instanceof Promis) {
      x.then(
        (value) => this.resolvePromise(promise, value, resolve, reject),
        reject
      );
    } else if (
      x !== null &&
      (typeof x === "object" || typeof x === "function")
    ) {
      let called = false;
      try {
        const { then } = x;
        if (typeof then === "function") {
          then.call(
            x,
            (value) => {
              if (called) {
                return;
              }
              called = true;
              this.resolvePromise(promise, value, resolve, reject);
            },
            (reason) => {
              if (called) {
                return;
              }
              called = true;
              reject(reason);
            }
          );
        } else {
          resolve(x);
        }
      } catch (error) {
        if (called) {
          return;
        }
        called = true;
        reject(error);
      }
    } else {
      resolve(x);
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

module.exports = Promis;
