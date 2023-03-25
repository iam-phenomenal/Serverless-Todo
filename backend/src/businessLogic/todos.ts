import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';


const logger = createLogger('TodosAccess')
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

//Create Todo
export async function createTodo(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info("Create Todo Business Logic")
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const todoItem = {todoId, userId, createdAt, done: false, attachmentUrl: null, ...newTodo}
    logger.info('Creating New Todo', todoItem)
    return await todosAccess.createTodoItem(todoItem)
}

// Get All Todos
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info("Get All Todo Business Logic")
    return await todosAccess.getAllTodos(userId)
}

// Update Todo
export async function updateTodo(todoId: string, todoUpdate: UpdateTodoRequest, 
    userId: string): Promise<TodoUpdate> {
    logger.info("Update Todo Business Logic")
    return todosAccess.updateTodoItem(todoId, todoUpdate, userId)
}


// Delete Todo
export async function deleteTodo(todoId: string, userId: string): Promise<string> {
    logger.info("Delete Todo Business Logic")
    return todosAccess.deleteTodoItem(todoId, userId)
}

    
//Create Attachment Presigned Url
export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info('Generate Upload Url Business Logic', {todoId, userId})
    const attachmentId = uuid.v4()
    const attachmentUrl = attachmentUtils.getAttachmentUrl(attachmentId)
    const uploadUrl = attachmentUtils.getUploadUrl(attachmentId)
    const todoItem = await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
    todoItem.attachmentUrl = uploadUrl
    logger.info('Attachment Url Updated', {todoItem})
    return todoItem.attachmentUrl
  }
