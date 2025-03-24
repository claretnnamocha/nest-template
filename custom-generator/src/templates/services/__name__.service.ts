import { Injectable } from '@nestjs/common';
import { BaseService, CatchServiceErrors } from 'src/common';

@Injectable()
@CatchServiceErrors()
export class <%= classify(name) %>Service extends BaseService {
}
