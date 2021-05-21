[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/analytics-cloud-data-generator)](https://api.reuse.software/info/github.com/SAP-samples/analytics-cloud-data-generator)

# SAP Analytics Cloud "Data to Value" generator (*d2v-datagen*)

## Description

 Analytics depend on real (or realistic) data sets to demonstrate for users the true power of the application. Although reasonable data sets exist, sometimes you just need a custom data set for a particular industry or line of business problem. You might also need a large data set, one with a specific granularity (day / hour / etc), or want to maintain some referential integrity between different dimension or measure values. Of course, you could do this in Excel, but it is challenging to manage relationships between dimensions, enforce constraints in measure values, and create large volumes of sample data. 

 This repository contains a NodeJS powered "engine" that works with Excel templates containing the dimensions, measures, and constraints. It produces fact data, representing the cartesian product of all dimensions, with values at each intersection. 

## Requirements

 - Install [NodeJS](https://nodejs.org/en/download/)
 - Your own SAP Analytics Cloud tenant or a [trial account](https://www.sap.com/products/cloud-analytics/trial.html)

## Download and Installation

 Run the following commands to clone the repository and execute the included sample:

``` 
git clone https://github.com/SAP-samples/analytics-cloud-data-generator.git
cd analytics-cloud-data-generator/code
npm install
node d2v_datagen.js
```

 Execute the code using the samples provided

```
Enter file name for dimension list: CENSUS_STAFFING
```

 Or

```
Enter file name for dimension list: SERVICE_TIMES
```

 - Samples and documentation for creating fact data can be found in the [input](/code/input/) directory
 - Sample outputs can be found in the [output](/code/output/) directory
 - Example dimensions for model creation in SAP Analytics Cloud are located in the [model](/code/model/) folder

## Known Issues

 No known issues at this time.

## How to obtain support

[Create an issue](https://github.com/SAP-samples/analytics-cloud-data-generator/issues) in this repository if you find a bug or have questions about the content.

## Contributing

 If you would like to contribute, please submit a Pull Request in the usual fashion.

## License
Copyright (c) 2021 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
