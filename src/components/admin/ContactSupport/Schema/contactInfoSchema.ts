import * as Yup from "yup";
const phoneRegExp = /^(\+?\d{7,15})$/;

export const contactInfoSchema = Yup.object().shape({
  phones: Yup.array()
    .of(
      Yup.object({
        number: Yup.string()
          .notRequired()
          .test(
            "is-valid-phone",
            "Invalid phone number",
            (value) => !value || phoneRegExp.test(value)
          ),
      })
    )
    .notRequired()
    .default([]),

  emails: Yup.array()
    .of(
      Yup.object({
        email: Yup.string()
          .notRequired()
          .test(
            "is-valid-email",
            "Invalid email",
            (value) => !value || Yup.string().email().isValidSync(value)
          ),
      })
    )
    .notRequired()
    .default([]),

  officeHour: Yup.string().notRequired(),

  emailInput: Yup.string()
    .notRequired()
    .test(
      "is-valid-email-input",
      "Invalid email",
      (value) => !value || Yup.string().email().isValidSync(value)
    ),

  phoneInput: Yup.string()
    .notRequired()
    .test(
      "is-valid-phone-input",
      "Invalid phone number",
      (value) => !value || phoneRegExp.test(value)
    ),
  officeHourTemp: Yup.string().notRequired(),
});

export type ContactInfoSchemaForm = Yup.InferType<typeof contactInfoSchema>;
