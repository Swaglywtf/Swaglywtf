import React, { useState } from "react";
import {
  Center,
  Heading,
  VStack,
  Input,
  Select,
  Button,
  useToast,
  Spacer,
  Box,
  Stepper as ChakraStepper,
  Step,
  StepIndicator,
  StepSeparator,
  StepStatus,
  StepNumber,
  useSteps,
  HStack,
  Text,
} from "@chakra-ui/react";
import { FaArrowCircleLeft } from "react-icons/fa";
import { useAccount, useAlert } from "@gear-js/react-hooks";
import { useSailsCalls } from "@/app/hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import { CONTRACT_DATA } from "@/app/consts";
import { useSailsConfig } from "@/app/hooks/useSailsConfig";

const steps = [
  "Select Action",
  "Enter Parameters",
  "Execute",
  "Completion",
];

function ServiceComponent() {
  const toast = useToast();
  const [selectedAction, setSelectedAction] = useState("");
  const [formData, setFormData] = useState({});
  const { activeStep, setActiveStep } = useSteps({ initialStep: 0 }); // Asegúrate de usar useSteps correctamente
  const [blockhash, setBlockhash] = useState<any>("");

  const { account } = useAccount();
  const sails = useSailsCalls();
  const alert = useAlert();

  const sailsConfig = {
    network: "wss://testnet.vara.network",
    contractId: CONTRACT_DATA.programId,
    idl: CONTRACT_DATA.idl,
  };

  useSailsConfig(sailsConfig);

  const actions = [
    { label: "Register Order", method: "RegisterOrderService", params: ["item_id", "user_wallet", "user_country"] },
    { label: "Update Inventory", method: "UpdateInventoryService", params: ["item_id", "quantity"] },
    { label: "Validate Payment", method: "ValidatePaymentService", params: ["method"] },
  ];

  const handleActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAction(event.target.value);
    setFormData({});
    setActiveStep(1); 
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!selectedAction) {
      toast({ title: "Please select an action", status: "error" });
      return;
    }

    const selectedMethod:any = actions.find(
      (action) => action.label === selectedAction
    );

    const callArguments = selectedMethod?.params.map(param => formData[param]);

    toast({
      render: () => (
        <Box color="white" p={3} bg="#00ffc4" borderRadius="md" boxShadow="lg">
          <Heading size="sm">Executing {selectedAction}</Heading>
          <Text mt={2}>Parameters: {JSON.stringify(callArguments)}</Text>
        </Box>
      ),
      duration: 5000,
      isClosable: true,
    });

    if (!sails) {
      alert.error("SailsCalls is not started!");
      return;
    }

    if (!account) {
      alert.error("Account is not ready");
      return;
    }

    const { signer } = await web3FromSource(account.meta.source);

    try {

      console.log(callArguments,)
      const response = await sails.command(
        selectedMethod.method,
        {
          userAddress: account.decodedAddress,
          signer,
        },
        {
         callArguments,
          callbacks: {
            onBlock(blockHash) {
              setBlockhash(blockHash);
            },
            onSuccess() {
              setActiveStep(3); 
              toast({ title: "Execution successful!", status: "success" });
            },
            onError() {
              alert.error("An error occurred!");
            },
          },
        }
      );

      console.log("Response: ", response);
    } catch (e) {
      alert.error("Error while sending message");
      console.error(e);
    }
  };

  const goToPreviousStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  return (
    <Center>
      <VStack spacing={6}>
        <Heading
          textColor="#00ffc4"
          textShadow="2px 2px 0 #00bfa1, 4px 4px 0 #008f7d, 6px 6px 0 rgba(0,0,0,0.2)"
          fontSize="4xl"
        >
          Service Form
        </Heading>
        <Spacer />
        <Box
          width="100%"
          maxW="600px"
          padding={6}
          boxShadow="lg"
          borderRadius="md"
          bg="gray.50"
        >
          <ChakraStepper size="lg" index={activeStep} colorScheme="teal" mb={6}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepNumber />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>
                <StepSeparator />
              </Step>
            ))}
          </ChakraStepper>

          {activeStep === 0 && (
            <VStack spacing={6}>
              <Select
                placeholder="Select Action"
                value={selectedAction}
                onChange={handleActionChange}
                bg="white"
                fontWeight="bold"
                color="black"
              >
                {actions.map((action, index) => (
                  <option key={index} value={action.label}>
                    {action.label}
                  </option>
                ))}
              </Select>
            </VStack>
          )}

          {activeStep === 1 && (
            <VStack spacing={6}>
              {actions
                .find((action) => action.label === selectedAction)
                ?.params.map((param, index) => (
                  <Input
                    key={index}
                    placeholder={param}
                    name={param}
                    value={formData[param] || ""}
                    onChange={handleInputChange}
                    bg="white"
                    fontWeight="bold"
                    color="black"
                    _placeholder={{ color: "gray.500" }}
                    borderColor="gray.300"
                    focusBorderColor="#00ffc4"
                  />
                ))}
              <HStack spacing={4}>
                <Button
                  bg="transparent"
                  color="black"
                  colorScheme="solid"
                  leftIcon={<FaArrowCircleLeft size="40px" color="#00ffc4" />}
                  onClick={goToPreviousStep}
                />

                <Button
                  onClick={handleSubmit}
                  bg="#00ffc4"
                  color="black"
                  _hover={{ bg: "#00e6b0" }}
                  fontWeight="bold"
                >
                  Execute {selectedAction}
                </Button>
              </HStack>
            </VStack>
          )}

          {activeStep === 3 && (
            <VStack spacing={6}>
              <Heading size="lg" color="teal.500">
                🎉 Successful Execution!
              </Heading>
              <Text>
                Your action has been successfully executed.
              </Text>
              <Button
                onClick={() => setActiveStep(0)}
                bg="#00ffc4"
                color="black"
                _hover={{ bg: "#00e6b0" }}
                fontWeight="bold"
              >
                Start Over
              </Button>
            </VStack>
          )}
        </Box>
      </VStack>
    </Center>
  );
}

export { ServiceComponent };