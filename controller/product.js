const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const Product = require("../model/product");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
   cloud_name: "dq87imngy",
   api_key: "784421224334212",
   api_secret: "Kam5Aj3WVIMIHtey38qMTokdDko",
});

exports.getCreateProduct = (req, res) => {
   res.render("createProduct", {
      pageTitle: "Create Product",
      message: null,
   });
};

exports.getUpdateProduct = async (req, res) => {
   try {
      const ProductId = req.params.ProductId;

      const IsValidParam = mongoose.Types.ObjectId.isValid(ProductId);

      if (!IsValidParam) {
         return res.render("updateProduct", {
            pageTitle: "Update Product",
            message: "Id you provided is not valid",
         });
      }

      const ProductExist = await Product.findById(ProductId);

      if (!ProductExist) {
         return res.redirect("/products/manage");
      }

      res.render("updateProduct", {
         pageTitle: "Update Product",
         message: null,
         product: ProductExist,
      });
   } catch (e) {
      console.log(e);
      res.render("updateProduct", {
         pageTitle: "Update Product Page",
         message: "Server Error Occured Please Try later",
      });
   }
};

exports.getProducts = async (req, res) => {
   try {
      const Products = await Product.find();

      if (!Products) {
         return res.render("products", {
            pageTitle: "Products Page",
            message: "No Products are available at the moment",
         });
      }

      res.render("products", {
         pageTitle: "Products Page",
         message: null,
         products: Products,
      });
   } catch (e) {
      console.log(e);
      res.render("products", {
         pageTitle: "Products Page",
         message: "Server Error Occured Please Try later",
      });
   }
};

exports.getProductManage = async (req, res) => {
   try {
      const Products = await Product.find();

      if (!Products) {
         return res.render("manageProducts", {
            pageTitle: "Products Manage Page",
            message: "No Products are available at the moment",
         });
      }

      res.render("manageProducts", {
         pageTitle: "Products Manage Page",
         message: null,
         products: Products,
      });
   } catch (e) {
      console.log(e);
      res.render("manageProducts", {
         pageTitle: "Products Manage Page",
         message: "Server Error Occured Please Try later",
      });
   }
};

exports.getSingleProduct = async (req, res) => {
   try {
      const ID = req.params.ProductId;

      const IsValidParam = mongoose.Types.ObjectId.isValid(ID);

      if (!IsValidParam) {
         return res.render("singleProduct", {
            pageTitle: "Single Product page",
            message: "Invalid Param provided",
            product: null,
         });
      }

      const ProductExist = await Product.findById(ID);

      if (!ProductExist) {
         return res.redirect("/products");
      }

      res.render("singleProduct", {
         pageTitle: "Single Product page",
         message: null,
         product: ProductExist,
      });
   } catch (e) {
      console.log(e);
      res.render("singleProduct", {
         pageTitle: "Single Product Page",
         message: "Server Error Occured Please Try later",
      });
   }
};

exports.PostProductCreate = async (req, res) => {
   const { title, price, description } = req.body;

   if (!title || !price || !req.file || !description) {
      fs.unlinkSync(req.file.path);
      return res.render("createProduct", {
         pageTitle: "Create Product",
         message: "All Fields are mandatory",
      });
   }

   try {
      // Image Resize Feature
      const { filename } = req.file;
      await sharp(req.file.path)
         .resize({ width: 1100, height: 320, fit: sharp.fit.cover })
         .jpeg({ quality: 90 })
         .toFile(path.resolve(req.file.destination, "resized", `${filename}.jpeg`));
      fs.unlinkSync(req.file.path);

      // Upload Image

      cloudinary.uploader.upload(
         path.resolve(req.file.destination, "resized", `${filename}.jpeg`),
         async (error, result) => {
            if (error) {
               console.log(error);
            }
            // Remove image from file
            fs.unlinkSync(
               path.resolve(req.file.destination, "resized", `${filename}.jpeg`)
            );

            // New Product
            const newProduct = new Product({
               title,
               price,
               description,
               image: result.url,
            });

            const ProductResult = await newProduct.save();

            return res.render("createProduct", {
               pageTitle: "Create Product",
               message: `Product created successfully with ${ProductResult.title}`,
            });
         }
      );
   } catch (e) {
      console.log(e);
      res.render("createProduct", {
         pageTitle: "Create Product",
         message: "Server Error Occured Please Try later",
      });
   }
};

exports.PostProductUpdate = async (req, res) => {
   try {
      const { title, price, oldImage, description, id } = req.body;
      let ImageLink;

      if (!req.file) {
         return res.redirect("/products/manage");
      }

      if (req.file) {
         const { filename } = req.file;
         await sharp(req.file.path)
            .resize({ width: 1100, height: 320, fit: sharp.fit.cover })
            .jpeg({ quality: 90 })
            .toFile(path.resolve(req.file.destination, "resized", `${filename}.jpeg`));

         ImageLink = req.file ? `${req.file.filename}.jpeg` : oldImage;

         fs.unlinkSync(req.file.path);
         if (oldImage) {
            fs.unlinkSync(path.resolve(require.main.path, "upload", "resized", oldImage));
         }
      }

      const ProductObject = {
         title,
         price,
         description,
         image: ImageLink,
      };

      await Product.findByIdAndUpdate({ _id: id }, ProductObject, {
         new: true,
      });

      res.redirect("/products");
   } catch (e) {
      console.log(e);
      res.redirect("/products/manage");
   }
};

exports.PostDeleteProduct = async (req, res) => {
   try {
      const { id } = req.body;

      if (!id) {
         return res.redirect("/products/manage");
      }

      const product = await Product.findById(id);

      fs.unlinkSync(product.image);

      await Product.findByIdAndRemove(id);

      res.redirect("/products/manage");
   } catch (e) {
      console.log(e);
      res.redirect("/products/manage");
   }
};
