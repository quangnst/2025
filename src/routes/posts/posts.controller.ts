import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PostsService } from './posts.service'
import envConfig from 'src/shared/config'

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  getPosts(): any {
    console.log(envConfig.ACCESS_TOKEN_SECRET);
    return this.postService.getPosts();
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postService.getPost(id);
  }

  @Post()
  createPost(@Body() body: any) {
    return this.postService.createPost(body);
  }

  @Put(":id")
  updatePost(@Param('id') id: string, @Body() body: any) {
    return this.postService.updatePost(id, body)
  }

  @Delete(":id")
  deletePost(@Param("id") id: string) {
    return this.postService.deletePost(id)
  }
}
