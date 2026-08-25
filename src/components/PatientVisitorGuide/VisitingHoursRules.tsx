import Image from "next/image";
import Paragraph from "../shared/Paragraph";
import Text from "../shared/Text";

const data = [
  "Visitors are strictly prohibited in ICUs, OTs, and Dialysis Unit.",
  "Children below 12 years of age are prohibited as visitors as they are more susceptible to infections.",
  "It is important for your visitors to be considerate towards other patients while they are visiting.",
  "Visitors are not allowed to bring flowers and food from outside.",
  "Visitors and attendants are not allowed to bring their own personal electronic gadgets like DVD, music system, etc.",
  "Smoking is not permitted in the hospital or within 50 feet of the buildings.",
  "Patients and visitors are requested not to take any photographs inside the hospital.",
];
export default function VisitingHoursRules() {
  return (
    <div>
      <Text className="lg:mb-6 mb-10">Visiting Hours & Rules</Text>
      <Paragraph className="xl:text-2xl font-semibold">
        Patient Visiting Hours
      </Paragraph>
      <Paragraph className="mb-6">
        For the safety of our patients, their caregivers and visitors, we ask
        you to limit visits to the hours specified below:
      </Paragraph>
      <ul className="list-disc list-inside mb-6 text-primary text-base font-normal">
        <li>
          Morning:{" "}
          <span className="text-secondary-foreground">
            10.30 am to 11.30 am
          </span>
        </li>
        <li>
          Evening:{" "}
          <span className="text-secondary-foreground">5.00 pm to 7.00 pm</span>
        </li>
      </ul>

      <Paragraph className="xl:text-2xl font-semibold">Visitor Rules</Paragraph>
      <Paragraph className="mb-6">
        Please follow the rules below and assist us in maintaining a peaceful
        environment for our patients and facilities:
      </Paragraph>
      <ul className="text-secondary-foreground text-base font-normal">
        {data.map((item, index) => (
          <li key={index} className="mb-2">
            <Image
              src="/icons/leftArrow.svg"
              className="inline-block mr-2 lg:mr-6 w-6 h-6"
              alt="Visitor Rule"
              width={32}
              height={32}
            />{" "}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
