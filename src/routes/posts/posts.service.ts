import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}
  getPosts() {
    return this.prismaService.post.findMany();
  }

  createPost(body: any) {
    return this.prismaService.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: body.authorId
      }
    })
  }

  getPost(id: string) {
    return `Post ${id}`;
  }

  updatePost(id: string, body) {
    return `Updated post ${id}`;
  }

  deletePost(id: string) {
    return `Deleted post ${id}`;
  }
}
