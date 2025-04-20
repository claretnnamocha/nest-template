import {
  Attributes,
  CountOptions,
  CreateOptions,
  CreationAttributes,
  DestroyOptions,
  FindAndCountOptions,
  FindOptions,
  FindOrCreateOptions,
  Identifier,
  Model,
  ModelStatic,
  UpdateOptions,
} from 'sequelize';
import { Col, Fn, Literal } from 'sequelize/types/utils';

export abstract class BaseRepository<S extends Model> {
  private schemaModel: ModelStatic<S>;

  constructor(schemaModel: ModelStatic<S>) {
    this.schemaModel = schemaModel;
  }

  async findOne(options?: FindOptions<Attributes<S>>) {
    return this.schemaModel.findOne(options);
  }

  async findAll(options?: FindOptions<Attributes<S>>) {
    return this.schemaModel.findAll(options);
  }

  async create<
    O extends CreateOptions<Attributes<S>> = CreateOptions<Attributes<S>>,
  >(values?: CreationAttributes<S>, options?: O) {
    return this.schemaModel.create(values, options);
  }

  async update(
    values: {
      [key in keyof Attributes<S>]?: Attributes<S>[key] | Fn | Col | Literal;
    },
    options: Omit<UpdateOptions<Attributes<S>>, 'returning'> & {
      returning: Exclude<
        UpdateOptions<Attributes<S>>['returning'],
        undefined | false
      >;
    },
  ) {
    return this.schemaModel.update(values, options);
  }

  async destroy(options?: DestroyOptions<Attributes<S>>) {
    return this.schemaModel.destroy(options);
  }

  async count(options?: Omit<CountOptions<Attributes<S>>, 'group'>) {
    return this.schemaModel.count(options);
  }

  async findByPk(
    identifier?: Identifier,
    options?: Omit<FindOptions<Attributes<S>>, 'where'>,
  ) {
    return this.schemaModel.findByPk(identifier, options);
  }

  async findOrCreate(
    options: FindOrCreateOptions<Attributes<S>, CreationAttributes<S>>,
  ) {
    return this.schemaModel.findOrCreate(options);
  }

  async findAndCountAll(
    options?: Omit<FindAndCountOptions<Attributes<S>>, 'group'>,
  ) {
    return this.schemaModel.findAndCountAll(options);
  }

  async findAndPaginate(
    options?: Omit<FindAndCountOptions<Attributes<S>>, 'group'>,
  ) {
    const { limit: pageCount, offset } = options || { limit: 10, offset: 0 };
    const { rows: data, count } = await this.schemaModel.findAndCountAll({
      ...options,
      limit: pageCount,
      offset,
    });

    return {
      data,
      count,
      pageCount,
      totalPages: Math.ceil(count / (pageCount || 1)),
      currentPage: Math.ceil((offset || 0) / (pageCount || 1)) + 1,
    };
  }
}
