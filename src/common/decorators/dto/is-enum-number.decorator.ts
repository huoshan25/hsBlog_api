import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsEnumNumber(enumType: object, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEnumNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          console.log(typeof 2 === 'number','value');
          const enumValues = Object.values(enumType).filter(val => typeof val === 'number');
          console.log(enumValues,'enumValues');
          return enumValues.includes(value);
        },
      },
    });
  };
}
