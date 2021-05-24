# Sample dimensions for models

- Refer to the folders here for CSV containing a mapping of Member ID to Descriptions. These can be used as the foundation for creating a model in SAP Analytics Cloud. Once the model is constructed and the dimensions created, the fact data generated in the previous steps can be directly imported to the model.

- Best practice is to generate fact data based on Member ID, as lengthy descriptions exponentially increase the size of the generated file.

- It is easiest to load fact data by managing dimension members separately, as part of the dimension management process. You can ensure the data load does not try to create new members by adjusting the Mapping Options

![Model Mapping Options](/img/ModelMappingOptions.png)
