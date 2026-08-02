import { validate } from 'class-validator';
import { CreateNewsDto } from './create-news.dto';
import { QueryNewsDto } from './query-news.dto';

describe('CreateNewsDto validation', () => {
  const cuid = 'cmsba7w2c0012zn9eet1j1u7z';

  it('accepts a cuid as categoryId (not only UUID)', async () => {
    const dto = new CreateNewsDto();
    dto.title = 'Título de prueba';
    dto.content = { type: 'doc', content: [] };
    dto.categoryId = cuid;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a cuid as subcategoryId', async () => {
    const dto = new CreateNewsDto();
    dto.title = 'Título de prueba';
    dto.subcategoryId = 'cmsba7w2f0015zn9e1a1b1c1d1';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a title that is too short', async () => {
    const dto = new CreateNewsDto();
    dto.title = 'Ti';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('accepts relatedArticleIds as plain strings (cuid or uuid)', async () => {
    const dto = new CreateNewsDto();
    dto.title = 'Título de prueba';
    dto.relatedArticleIds = [cuid, '1aefbb6f-0835-44d6-8412-05fbb53473e5'];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

describe('QueryNewsDto validation', () => {
  it('accepts a cuid as categoryId and authorId', async () => {
    const dto = new QueryNewsDto();
    dto.categoryId = 'cmsba7w2c0012zn9eet1j1u7z';
    dto.authorId = 'cmsba7w1n0010zn9e5xh2e2yb';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
