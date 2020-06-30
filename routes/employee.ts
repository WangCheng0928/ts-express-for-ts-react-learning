import express from 'express'
import bodyParser from 'body-parser'
import query from '../modals/query'
import excelExport from 'excel-export'

let router = express.Router()
const urlencodeParser = bodyParser.urlencoded({ extended: false })

let queryAllSQL = `SELECT employee.*, level.level, department.department 
FROM employee, level, department 
WHERE employee.levelId = level.id AND employee.departmentId = department.id`

router.get('/getEmployee', async (req, res) => {
  let { name = '', departmentId } = req.query
  let conditions = `AND employee.name LIKE '%${name}%'`
  if (departmentId) {
    conditions = conditions + `AND employee.departmentId=${departmentId}`
  }
  let sql = `${queryAllSQL} ${conditions} ORDER BY employee.id DESC`
  try {
    let result = await query(sql)
    console.log('get', result)
    result.forEach((i: any) => {
      i.key = i.id
    })
    res.json({
      flag: 0,
      data: result,
    })
  } catch (e) {
    res.json({
      flag: 1,
      msg: e.toString(),
    })
  }
})

router.post('/createEmployee', urlencodeParser, async (req, res) => {
  let { name, departmentId, hiredate, levelId } = req.body
  let sql = `INSERT INTO employee (name, departmentId, hiredate, levelId) VALUES ('${name}', ${departmentId}, '${hiredate}', ${levelId})`
  try {
    let result = await query(sql)
    console.log('add', result)
    res.json({
      flag: 0,
      data: {
        key: result.insertId,
        id: result.insertId,
      },
    })
  } catch (e) {
    res.json({
      flag: 1,
      msg: e.toString(),
    })
  }
})

let conf: excelExport.config = {
  cols: [
    { caption: '员工ID', type: 'number' },
    { caption: '姓名', type: 'string' },
    { caption: '部门', type: 'string' },
    { caption: '入职时间', type: 'string' },
    { caption: '职级', type: 'string' },
  ],
  rows: [],
}

router.get('/downloadEmployee', async (req, res) => {
  try {
    let result = await query(queryAllSQL)
    conf.rows = result.map((i: any) => {
      return [i.id, i.name, i.department, i.hiredate, i.level]
    })
    let excel = excelExport.execute(conf)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats')
    res.setHeader('Content-Disposition', 'attachment; filename=Employee.xlsx')
    res.end(excel, 'binary')
  } catch (e) {
    res.send(e.toString())
  }
})

export default router
