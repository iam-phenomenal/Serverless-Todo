import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
var AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient =  new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME,
    ) {}

    // Create Todo
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Create Todo in Database')
        const result = await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()
        logger.info('Todo item created', result)
        return todoItem as TodoItem
    }

    //Get All Todos
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Get All Todos from Database')
        
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        logger.info('Todo items fetched')
        const todoItems = result.Items
        return todoItems as TodoItem[]
    }

    // Update Todo
    async updateTodoItem(todoId: string, todoUpdate: TodoUpdate, 
        userId: string): Promise<TodoUpdate> {    
        
        logger.info('Update Todo Item')
        
        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {todoId, userId},
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            },
            ExpressionAttributeNames: {'#name': 'name'},
            ReturnValues: 'ALL_NEW'
        }).promise()
        const todoItemUpdate = result.Attributes
        
        logger.info('Todo item updated', todoItemUpdate)
        return todoItemUpdate as TodoUpdate
    }

    //Delete Todo
    async deleteTodoItem(todoId: string, userId: string): Promise<string> {
        logger.info('Delete Todo')
        
        const result = await this.docClient.delete({
            TableName: this.todosTable,
            Key: {todoId, userId}
        }).promise()

        logger.info('Todo item deleted', result)
        return todoId as string
    }

    //Update Todo Attachment
    async updateAttachmentUrl(userId: string,todoId: string, url: string
      ): Promise<TodoItem> {
        logger.info('Add Attachment URL', {todoId,userId})
    
        const updateResult = await this.docClient.update({
            TableName: this.todosTable,
            Key: {userId, todoId},
            ConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeNames: {'#urls': 'attachmentUrl'},
            ExpressionAttributeValues: {
              ':userId': userId,
              ':todoId': todoId,
              ':newUrl': url
            },
            UpdateExpression: 'set #urls = :newUrl',
            ReturnValues: 'ALL_NEW'
        }).promise()
    
        return updateResult.Attributes as TodoItem
    }
}