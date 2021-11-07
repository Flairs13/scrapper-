const rub = '₽'
const foo = new RegExp(`${rub}`, "g")
console.log('641 asd232asd ₽ ₽'.replace(/[\D]/g, ""))
console.log('641 asd232asd ₽ ₽'.replace(foo, ""))


console.log('641 ---- ₽₽₽'.replace(new RegExp(`/d`, 'g',), ""))

const result = []
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve({chlen: 5})
  } ,1000)
})

const asyncFunc = async (a) => {
  await result.push(5)
}


console.log(asyncFunc(5))
console.log([{foo: 2}, {foo: 3}].findIndex((item) => item.foo === 0))