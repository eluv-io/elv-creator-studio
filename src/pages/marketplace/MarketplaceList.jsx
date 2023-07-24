import {useState} from "react";
import {Container} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {CheckboxCard, ContainedInputs} from "../../components/common/Inputs";

const MarketplaceList = observer(() => {
  const [checked, setChecked] = useState(false);

  return (
    <Container m="xl" p="xl" className="asd">
      container

      <CheckboxCard
        title="@mantine/core"
        description="Core components library: inputs, buttons, overlays, etc"
        checked={checked}
        onChange={setChecked}
      />
      <ContainedInputs />
    </Container>
  );
});

export default MarketplaceList;
